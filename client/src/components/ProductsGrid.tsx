import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "./ProductCard";
import type { Product } from "@shared/schema";

export default function ProductsGrid() {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products.filter(product => {
    if (filter === "all") return true;
    return product.platform === filter;
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
      <section id="products" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4 text-destructive">Error Loading Products</h3>
            <p className="text-muted-foreground">Failed to fetch products. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Featured Products</h3>
          <p className="text-lg text-muted-foreground">Discover amazing deals from Amazon and Flipkart</p>
        </div>
        
        {/* Filter and Sort Options */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter("all")}
              data-testid="filter-all"
            >
              All
            </Button>
            <Button
              variant={filter === "amazon" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter("amazon")}
              data-testid="filter-amazon"
            >
              Amazon
            </Button>
            <Button
              variant={filter === "flipkart" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter("flipkart")}
              data-testid="filter-flipkart"
            >
              Flipkart
            </Button>
          </div>
          
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
              {filter === "all" 
                ? "Start by adding your first product using the form above."
                : `No ${filter} products found. Try a different filter.`
              }
            </p>
            <Button 
              onClick={() => {
                const element = document.getElementById("add-product");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              data-testid="button-add-first-product"
            >
              <i className="fas fa-plus mr-2"></i>Add Your First Product
            </Button>
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
    </section>
  );
}
