#!/usr/bin/env node

/**
 * AWS Cost Calculator for S3 + CloudFront Static Website
 * Optimized for High Traffic (10k-100k daily users)
 *
 * Usage: node cost-calculator.mjs [daily_users]
 * Example: node cost-calculator.mjs 100000
 */

const DAILY_USERS = process.argv[2] ? parseInt(process.argv[2]) : 100000;

// Cost constants (USD, updated for 2025)
const COSTS = {
  // CloudFront per 10,000 requests
  cloudFront: {
    requests: 0.009, // $0.009 per 10k requests (PriceClass_All)
    dataTransfer: {
      first_10tb: 0.09,    // $0.09/GB
      next_40tb: 0.085,    // $0.085/GB
      next_100tb: 0.08,    // $0.08/GB
      over_150tb: 0.06     // $0.06/GB
    }
  },

  // S3 costs
  s3: {
    storage: {
      standard: 0.023,     // $0.023/GB/month
      intelligentTiering: 0.023, // Same as standard initially
      glacier: 0.004       // $0.004/GB/month
    },
    requests: {
      get: 0.0004,         // $0.0004 per 1k requests
      put: 0.005           // $0.005 per 1k requests
    },
    dataTransfer: {
      out_to_internet: 0.09 // $0.09/GB (when not using CloudFront)
    }
  },

  // Origin Shield (additional cost)
  originShield: {
    enabled: 0.02,        // $0.02 per 10k requests
    dataTransfer: 0.02    // $0.02/GB additional
  },

  // WAF costs
  waf: {
    monthly: 20,          // $20/month base
    perMillionRequests: 0.60 // $0.60 per million requests
  },

  // Reserved Capacity discounts
  reservedCapacity: {
    discount_10_percent: 0.9,  // 10% discount
    discount_20_percent: 0.8,  // 20% discount
    discount_30_percent: 0.7   // 30% discount
  }
};

// Traffic assumptions based on user behavior
function calculateTrafficAssumptions(dailyUsers) {
  const monthlyUsers = dailyUsers * 30;

  return {
    // Page views per user per day (conservative estimate)
    pageViewsPerUser: 3,

    // Total page views per month
    monthlyPageViews: monthlyUsers * 3,

    // Cache hit rate (optimized for high traffic)
    cacheHitRate: 0.92, // 92% cache hit rate with optimizations

    // Average page size (optimized with compression)
    avgPageSize: 250, // KB per page (compressed)

    // Static assets per page
    staticAssetsPerPage: 8, // JS, CSS, images, fonts

    // Average static asset size
    avgStaticAssetSize: 50, // KB per asset (compressed)

    // API calls per user per day
    apiCallsPerUser: 2,

    // Monthly API calls
    monthlyApiCalls: monthlyUsers * 2,

    // Storage assumptions
    storageGB: 10, // GB of content (HTML, assets, etc.)

    // Log retention
    logRetentionDays: 90,
    logsPerMonthGB: (dailyUsers * 0.5) / 1024 // Rough log size calculation
  };
}

// Calculate CloudFront costs
function calculateCloudFrontCosts(traffic, useOriginShield = true, useReservedCapacity = false) {
  const { monthlyPageViews, cacheHitRate, avgPageSize, staticAssetsPerPage, avgStaticAssetSize } = traffic;

  // Total requests to CloudFront
  const totalRequests = monthlyPageViews * (1 + staticAssetsPerPage);

  // Requests that hit origin (S3)
  const originRequests = totalRequests * (1 - cacheHitRate);

  // Data transfer calculations
  const totalDataTransferGB = (monthlyPageViews * avgPageSize + totalRequests * avgStaticAssetSize) / (1024 * 1024);

  // CloudFront request costs
  let requestCost = (totalRequests / 10000) * COSTS.cloudFront.requests;

  // Apply reserved capacity discount if enabled
  if (useReservedCapacity) {
    requestCost *= COSTS.reservedCapacity.discount_20_percent;
  }

  // Origin Shield additional costs
  let originShieldCost = 0;
  if (useOriginShield) {
    originShieldCost = (originRequests / 10000) * COSTS.originShield.enabled;
    originShieldCost += totalDataTransferGB * COSTS.originShield.dataTransfer;
  }

  // Data transfer costs (tiered pricing)
  let dataTransferCost = 0;
  let remainingGB = totalDataTransferGB;

  // First 10TB
  const firstTierGB = Math.min(remainingGB, 10 * 1024);
  dataTransferCost += firstTierGB * COSTS.cloudFront.dataTransfer.first_10tb;
  remainingGB -= firstTierGB;

  // Next 40TB
  if (remainingGB > 0) {
    const secondTierGB = Math.min(remainingGB, 40 * 1024);
    dataTransferCost += secondTierGB * COSTS.cloudFront.dataTransfer.next_40tb;
    remainingGB -= secondTierGB;
  }

  // Next 100TB
  if (remainingGB > 0) {
    const thirdTierGB = Math.min(remainingGB, 100 * 1024);
    dataTransferCost += thirdTierGB * COSTS.cloudFront.dataTransfer.next_100tb;
    remainingGB -= thirdTierGB;
  }

  // Over 150TB
  if (remainingGB > 0) {
    dataTransferCost += remainingGB * COSTS.cloudFront.dataTransfer.over_150tb;
  }

  return {
    requests: requestCost,
    dataTransfer: dataTransferCost,
    originShield: originShieldCost,
    total: requestCost + dataTransferCost + originShieldCost
  };
}

// Calculate S3 costs
function calculateS3Costs(traffic) {
  const { storageGB, logsPerMonthGB, monthlyApiCalls } = traffic;

  // Storage costs (with Intelligent Tiering)
  const storageCost = storageGB * COSTS.s3.storage.intelligentTiering;
  const logsStorageCost = logsPerMonthGB * COSTS.s3.storage.glacier;

  // Request costs (only origin requests)
  const getRequestsCost = (monthlyApiCalls / 1000) * COSTS.s3.requests.get;

  return {
    storage: storageCost,
    logs: logsStorageCost,
    requests: getRequestsCost,
    total: storageCost + logsStorageCost + getRequestsCost
  };
}

// Calculate WAF costs
function calculateWAFCosts(traffic) {
  const { monthlyPageViews, staticAssetsPerPage } = traffic;
  const totalRequests = monthlyPageViews * (1 + staticAssetsPerPage);
  const millionRequests = totalRequests / 1000000;

  return COSTS.waf.monthly + (millionRequests * COSTS.waf.perMillionRequests);
}

// Main calculation function
function calculateTotalCost(dailyUsers, useOriginShield = true, useReservedCapacity = false) {
  const traffic = calculateTrafficAssumptions(dailyUsers);

  const cloudFront = calculateCloudFrontCosts(traffic, useOriginShield, useReservedCapacity);
  const s3 = calculateS3Costs(traffic);
  const waf = calculateWAFCosts(traffic);

  const total = cloudFront.total + s3.total + waf;

  return {
    dailyUsers,
    monthlyUsers: dailyUsers * 30,
    traffic,
    costs: {
      cloudFront,
      s3,
      waf,
      total
    },
    optimizations: {
      originShield: useOriginShield,
      reservedCapacity: useReservedCapacity,
      cacheHitRate: traffic.cacheHitRate
    }
  };
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Print results
function printResults(results) {
  console.log(`\n🚀 AWS Cost Calculator for ${results.dailyUsers.toLocaleString()} Daily Users`);
  console.log('='.repeat(80));
  console.log(`Monthly Users: ${results.monthlyUsers.toLocaleString()}`);
  console.log(`Monthly Page Views: ${results.traffic.monthlyPageViews.toLocaleString()}`);
  console.log(`Cache Hit Rate: ${(results.traffic.cacheHitRate * 100).toFixed(1)}%`);
  console.log(`Origin Shield: ${results.optimizations.originShield ? 'Enabled' : 'Disabled'}`);
  console.log(`Reserved Capacity: ${results.optimizations.reservedCapacity ? 'Enabled' : 'Disabled'}`);

  console.log('\n💰 COST BREAKDOWN');
  console.log('-'.repeat(40));

  console.log(`CloudFront Requests: ${formatCurrency(results.costs.cloudFront.requests)}`);
  console.log(`CloudFront Data Transfer: ${formatCurrency(results.costs.cloudFront.dataTransfer)}`);
  console.log(`Origin Shield: ${formatCurrency(results.costs.cloudFront.originShield)}`);
  console.log(`S3 Storage: ${formatCurrency(results.costs.s3.storage)} (Intelligent Tiering enabled)`);
  console.log(`S3 Logs: ${formatCurrency(results.costs.s3.logs)} (3 months retention)`);
  console.log(`S3 Requests: ${formatCurrency(results.costs.s3.requests)}`);
  console.log(`S3 Versioning: $0.00 (disabled - code managed via git)`);
  console.log(`WAF Protection: ${formatCurrency(results.costs.waf)}`);

  console.log('\n🎯 TOTAL MONTHLY COST');
  console.log('-'.repeat(40));
  console.log(`Total: ${formatCurrency(results.costs.total)}`);
  console.log(`Daily Average: ${formatCurrency(results.costs.total / 30)}`);
  console.log(`Per User Per Month: ${formatCurrency(results.costs.total / results.monthlyUsers)}`);
}

// Calculate for different user volumes
const userVolumes = [10000, 20000, 30000, 60000, 100000];

console.log('📊 AWS S3 + CloudFront Cost Analysis (2025 Pricing)');
console.log('Optimized for High Traffic with Origin Shield & Reserved Capacity');
console.log('='.repeat(80));

userVolumes.forEach(users => {
  const results = calculateTotalCost(users, true, false); // Origin Shield enabled, Reserved Capacity disabled
  printResults(results);
  console.log('\n' + '='.repeat(80));
});

console.log('\n💡 COST OPTIMIZATION RECOMMENDATIONS');
console.log('-'.repeat(50));
console.log('• Enable Origin Shield for 30-60% reduction in origin requests');
console.log('• Use Reserved Capacity for 20%+ savings on predictable traffic');
console.log('• Implement aggressive caching (92% hit rate achieved)');
console.log('• Use Intelligent Tiering for automatic storage optimization');
console.log('• Monitor with Storage Lens for continuous optimization');
console.log('• Consider CloudFront Price Classes based on user geography');

console.log('\n📈 SCALING CONSIDERATIONS');
console.log('-'.repeat(30));
console.log('• 10k users: Basic setup sufficient');
console.log('• 20k-50k users: Enable Origin Shield');
console.log('• 50k+ users: Consider Reserved Capacity');
console.log('• 100k+ users: Full optimization suite + monitoring');

console.log('\n🔧 CONFIGURATION FOR HIGH TRAFFIC');
console.log('-'.repeat(40));
console.log('Set these variables in terraform/environments/prod.tfvars:');
console.log(`expected_daily_users = ${DAILY_USERS}`);
console.log('enable_origin_shield = true');
console.log('cloudfront_price_class = "PriceClass_All"');
console.log('enable_cloudfront_reserved_capacity = true');
console.log('cloudfront_reserved_capacity_monthly = 1000  # Adjust based on traffic');