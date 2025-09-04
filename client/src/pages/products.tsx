import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SocialButtons from "@/components/SocialButtons";
import type { Product } from "@shared/schema";

export default function Products() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter(product => {
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
    if (platformFilter !== "all" && product.platform !== platformFilter) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.salePrice || "0") - parseFloat(b.salePrice || "0");
      case "price-high":
        return parseFloat(b.salePrice || "0") - parseFloat(a.salePrice || "0");
      case "discount-high":
        return (b.discount || 0) - (a.discount || 0);
      default: // newest
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4 text-destructive">Error Loading Products</h3>
          <p className="text-muted-foreground">Failed to fetch products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo */}
            <div>
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" data-testid="logo-link">
                <i className="fas fa-tag text-primary text-2xl"></i>
                <h1 className="text-2xl font-bold text-primary">DealPro</h1>
              </Link>
            </div>
            
            {/* Center - Navigation Menu */}
            <div className="flex items-center space-x-6">
              <Link to="/home">
                <Button variant="ghost" data-testid="nav-home">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
            
            {/* Right side - Contact */}
            <div>
              <Button variant="outline" onClick={() => window.open('mailto:ajaypynetech@gmail.com', '_blank')} data-testid="nav-contact">
                <i className="fas fa-envelope mr-2"></i>Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Amazing Products
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Browse through our curated collection of products from Amazon and Flipkart with detailed information and great deals.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-green-500"></i>
                Real-time pricing
              </span>
              <span className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-green-500"></i>
                Direct purchase links
              </span>
              <span className="flex items-center">
                <i className="fas fa-check-circle mr-2 text-green-500"></i>
                Updated product info
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48" data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Platform Filter */}
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40" data-testid="select-platform">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="flipkart">Flipkart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="discount-high">Discount: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Info */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-muted-foreground">Loading products...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-box-open text-muted-foreground text-2xl"></i>
            </div>
            <h4 className="text-xl font-semibold mb-2">No Products Found</h4>
            <p className="text-muted-foreground mb-6">
              {products.length === 0 
                ? "We're adding amazing products daily. Check back soon for the best deals!"
                : "No products match your current filters. Try adjusting your search criteria."
              }
            </p>
            {products.length === 0 && (
              <Button 
                variant="outline" 
                onClick={() => window.open('mailto:ajaypynetech@gmail.com?subject=Product%20Suggestion', '_blank')}
                data-testid="button-suggest-product"
              >
                <i className="fas fa-lightbulb mr-2"></i>Suggest Products
              </Button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && sortedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
      <ScrollToTop />
      <SocialButtons />
    </div>
  );
}