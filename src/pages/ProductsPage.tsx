import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import { OptimizedImage } from '../shared/components/OptimizedImage';
import { typographyVariants, animationUtils } from '../design-system/variants';

// Products data - Single source of truth
const productsData = {
  categories: [
    { id: 'all', name: 'All Products', count: 24 },
    { id: 'electronics', name: 'Electronics', count: 8 },
    { id: 'clothing', name: 'Clothing', count: 12 },
    { id: 'books', name: 'Books', count: 4 },
  ],

  products: [
    {
      id: 1,
      name: 'MacBook Pro 16"',
      category: 'electronics',
      price: 2499,
      originalPrice: 2799,
      rating: 4.8,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
      badge: 'Best Seller',
      badgeVariant: 'success' as const,
      features: ['M3 Pro Chip', '18GB Unified Memory', '512GB SSD', 'Liquid Retina XDR Display'],
      inStock: true,
    },
    {
      id: 2,
      name: 'iPhone 15 Pro',
      category: 'electronics',
      price: 999,
      originalPrice: null,
      rating: 4.9,
      reviews: 256,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
      badge: 'New',
      badgeVariant: 'primary' as const,
      features: ['A17 Pro Chip', 'Titanium Design', 'Advanced Camera System', '5G Compatible'],
      inStock: true,
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5',
      category: 'electronics',
      price: 349,
      originalPrice: 399,
      rating: 4.7,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      badge: 'Sale',
      badgeVariant: 'danger' as const,
      features: ['Industry Leading Noise Canceling', '30hr Battery Life', 'Hi-Res Audio', 'Multipoint Connection'],
      inStock: true,
    },
    {
      id: 4,
      name: 'Premium Cotton T-Shirt',
      category: 'clothing',
      price: 29,
      originalPrice: 39,
      rating: 4.5,
      reviews: 45,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      badge: 'Eco-Friendly',
      badgeVariant: 'success' as const,
      features: ['100% Organic Cotton', 'Comfortable Fit', 'Machine Washable', 'Available in 8 Colors'],
      inStock: true,
    },
    {
      id: 5,
      name: 'Designer Jeans',
      category: 'clothing',
      price: 89,
      originalPrice: null,
      rating: 4.6,
      reviews: 72,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
      badge: 'Limited Edition',
      badgeVariant: 'secondary' as const,
      features: ['Premium Denim', 'Tailored Fit', 'Reinforced Stitching', 'Sustainable Manufacturing'],
      inStock: false,
    },
    {
      id: 6,
      name: 'Winter Jacket',
      category: 'clothing',
      price: 149,
      originalPrice: 199,
      rating: 4.4,
      reviews: 34,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      badge: 'Winter Sale',
      badgeVariant: 'info' as const,
      features: ['Water Resistant', 'Insulated Lining', 'Multiple Pockets', 'Wind Protection'],
      inStock: true,
    },
    {
      id: 7,
      name: 'JavaScript: The Good Parts',
      category: 'books',
      price: 24,
      originalPrice: 34,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
      badge: 'Classic',
      badgeVariant: 'warning' as const,
      features: ['Essential JavaScript Guide', 'Expert Author', 'Practical Examples', 'Industry Standard'],
      inStock: true,
    },
    {
      id: 8,
      name: 'React 19 Mastery',
      category: 'books',
      price: 39,
      originalPrice: null,
      rating: 4.9,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
      badge: 'New Release',
      badgeVariant: 'primary' as const,
      features: ['Latest React Features', 'Hands-on Projects', 'Advanced Patterns', 'Real-world Examples'],
      inStock: true,
    },
  ],

  stats: [
    { label: 'Total Products', value: '2,500+', icon: '📦' },
    { label: 'Happy Customers', value: '50,000+', icon: '😊' },
    { label: 'Countries Served', value: '125+', icon: '🌍' },
    { label: 'Five-Star Reviews', value: '95%', icon: '⭐' },
  ],
};

export default function ProductsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className={`${typographyVariants.headings.h1} text-gradient`}>
          Our Products
        </h1>
        <p className={`${typographyVariants.body.xl} text-gray-600 max-w-3xl mx-auto`}>
          Discover our carefully curated collection of premium products designed to enhance your lifestyle
        </p>
      </section>

      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {productsData.stats.map((stat, index) => (
            <Card 
              key={index} 
              hover 
              className={`text-center ${animationUtils.withStagger('animate-scale-in', index)}`}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Category Filter */}
      <section>
        <div className="flex flex-wrap justify-center gap-3">
          {productsData.categories.map((category) => (
            <Button
              key={category.id}
              variant={category.id === 'all' ? 'primary' : 'outline'}
              size="md"
              className="group"
            >
              {category.name}
              <Badge variant="gray" className="ml-2 group-hover:bg-blue-100 group-hover:opacity-80 transition-colors">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {productsData.products.map((product, index) => (
            <Card 
              key={product.id} 
              hover 
              className={`group relative overflow-hidden ${animationUtils.withStagger('animate-slide-up', index)}`}
            >
              {/* Product Badge */}
              <div className="absolute top-4 left-4 z-10">
                <Badge variant={product.badgeVariant}>
                  {product.badge}
                </Badge>
              </div>

              {/* Stock Status */}
              {!product.inStock && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="gray">Out of Stock</Badge>
                </div>
              )}

              {/* Product Image */}
              <div className="relative overflow-hidden rounded-xl mb-4">
                <OptimizedImage
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  priority={false}
                  quality={85}
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-brand-primary transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  {product.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice && (
                    <Badge variant="danger" className="text-xs">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Load More */}
      <section className="text-center">
        <Button variant="outline" size="lg">
          Load More Products
        </Button>
      </section>

      {/* Newsletter Signup */}
      <Card className="bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 text-white text-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Stay Updated</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Get notified about new products, exclusive deals, and special offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button variant="secondary" size="md" className="bg-white text-brand-primary hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
