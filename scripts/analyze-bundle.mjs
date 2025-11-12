#!/usr/bin/env node

/**
 * AWS CloudFront Bundle Analysis
 * Analyzes build output for CloudFront optimization
 * Replaces custom bundle analysis with AWS-specific insights
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @typedef {Object} BundleFile
 * @property {string} name - File name
 * @property {number} size - File size in bytes
 * @property {number} [gzipSize] - Gzipped size in bytes
 * @property {'js'|'css'|'asset'} type - File type
 */

/**
 * @typedef {Object} ChunkInfo
 * @property {string} name - Chunk name
 * @property {BundleFile[]} files - Files in chunk
 * @property {number} totalSize - Total chunk size
 * @property {'long-term'|'short-term'|'no-cache'} cacheStrategy - CloudFront cache strategy
 */

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function getCacheStrategy(fileName) {
  if (fileName.includes('vendor') || fileName.includes('shared')) {
    return 'long-term'; // CloudFront long cache (1 year)
  }
  if (fileName.includes('feature') || fileName.includes('page')) {
    return 'short-term'; // CloudFront medium cache (1 week)
  }
  return 'no-cache'; // CloudFront short cache (1 hour)
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getCloudFrontRecommendations(chunks) {
  const recommendations = [];
  
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.totalSize, 0);
  const vendorChunks = chunks.filter(c => c.name.includes('vendor'));
  const featureChunks = chunks.filter(c => c.name.includes('feature'));
  
  // Size recommendations
  if (totalSize > 500 * 1024) {
    recommendations.push('⚠️ Total bundle size > 500KB - Consider further code splitting');
  }
  
  // Cache strategy recommendations
  const longTermCache = chunks.filter(c => c.cacheStrategy === 'long-term');
  if (longTermCache.length < 2) {
    recommendations.push('📦 Create more vendor chunks for better CloudFront caching');
  }
  
  // Chunk size recommendations
  const largeChunks = chunks.filter(c => c.totalSize > 100 * 1024);
  if (largeChunks.length > 0) {
    recommendations.push(`🔧 Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}`);
  }
  
  // HTTP/2 optimization
  if (chunks.length > 10) {
    recommendations.push('🚀 Good chunk granularity for HTTP/2 parallel loading');
  }
  
  return recommendations;
}

async function analyzeBundles() {
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  try {
    await fs.access(distPath);
  } catch {
    console.error('❌ Build directory not found. Run `npm run build` first.');
    process.exit(1);
  }
  
  console.log('🔍 AWS CloudFront Bundle Analysis\\n');
  
  try {
    const files = await fs.readdir(assetsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    
    // Group files by chunk
    const chunks = {};
    
    for (const file of [...jsFiles, ...cssFiles]) {
      const chunkName = file.split('-')[0] || 'main';
      const filePath = path.join(assetsPath, file);
      const size = await getFileSize(filePath);
      const type = file.endsWith('.js') ? 'js' : 'css';
      
      if (!chunks[chunkName]) {
        chunks[chunkName] = [];
      }
      
      chunks[chunkName].push({
        name: file,
        size,
        type,
      });
    }
    
    // Create chunk analysis
    const chunkInfo = Object.entries(chunks).map(([name, files]) => ({
      name,
      files,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      cacheStrategy: getCacheStrategy(name),
    }));
    
    // Sort by size (largest first)
    chunkInfo.sort((a, b) => b.totalSize - a.totalSize);
    
    // Display results
    console.log('📊 Chunk Analysis (CloudFront Optimized)');
    console.log('─'.repeat(80));
    
    chunkInfo.forEach(chunk => {
      const cacheIcon = chunk.cacheStrategy === 'long-term' ? '🟢' : 
                       chunk.cacheStrategy === 'short-term' ? '🟡' : '🔴';
      
      console.log(`${cacheIcon} ${chunk.name.padEnd(20)} ${formatSize(chunk.totalSize).padStart(10)} (${chunk.cacheStrategy})`);
      
      chunk.files.forEach(file => {
        const typeIcon = file.type === 'js' ? '📜' : '🎨';
        console.log(`  ${typeIcon} ${file.name.padEnd(35)} ${formatSize(file.size).padStart(8)}`);
      });
      console.log();
    });
    
    // Summary
    const totalSize = chunkInfo.reduce((sum, chunk) => sum + chunk.totalSize, 0);
    console.log('📈 Summary');
    console.log('─'.repeat(40));
    console.log(`Total Bundle Size: ${formatSize(totalSize)}`);
    console.log(`Number of Chunks: ${chunkInfo.length}`);
    console.log(`JavaScript: ${formatSize(chunkInfo.reduce((sum, c) => sum + c.files.filter(f => f.type === 'js').reduce((s, f) => s + f.size, 0), 0))}`);
    console.log(`CSS: ${formatSize(chunkInfo.reduce((sum, c) => sum + c.files.filter(f => f.type === 'css').reduce((s, f) => s + f.size, 0), 0))}\\n`);
    
    // CloudFront recommendations
    const recommendations = getCloudFrontRecommendations(chunkInfo);
    
    if (recommendations.length > 0) {
      console.log('💡 CloudFront Optimization Recommendations');
      console.log('─'.repeat(50));
      recommendations.forEach(rec => console.log(rec));
      console.log();
    }
    
    // Cache strategy breakdown
    console.log('🏷️ CloudFront Cache Strategy');
    console.log('─'.repeat(40));
    const longTerm = chunkInfo.filter(c => c.cacheStrategy === 'long-term');
    const shortTerm = chunkInfo.filter(c => c.cacheStrategy === 'short-term');
    const noCache = chunkInfo.filter(c => c.cacheStrategy === 'no-cache');
    
    console.log(`🟢 Long-term (1 year): ${longTerm.length} chunks`);
    console.log(`🟡 Short-term (1 week): ${shortTerm.length} chunks`);
    console.log(`🔴 No cache (1 hour): ${noCache.length} chunks`);
    
    console.log('\\n✨ AWS CloudFront will handle:');
    console.log('   • Brotli/Gzip compression');
    console.log('   • Edge caching (200+ locations)');
    console.log('   • HTTP/2 push optimization');
    console.log('   • Origin shield caching');
    
  } catch (error) {
    console.error('❌ Error analyzing bundles:', error);
    process.exit(1);
  }
}

// Execute analysis
analyzeBundles().catch(console.error);