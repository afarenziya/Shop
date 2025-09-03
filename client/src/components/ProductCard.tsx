import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Product Removed",
        description: "The product has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({
        title: "Failed to Remove Product",
        description: "There was an error removing the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemove = () => {
    deleteProductMutation.mutate(product.id);
  };

  const handleViewProduct = () => {
    window.open(product.productUrl, '_blank', 'noopener,noreferrer');
  };

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return null;
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const platformConfig = {
    amazon: {
      color: "bg-accent text-accent-foreground",
      buttonColor: "bg-accent text-accent-foreground hover:bg-accent/90",
      icon: "fab fa-amazon",
      label: "Amazon"
    },
    flipkart: {
      color: "bg-blue-500 text-white",
      buttonColor: "bg-blue-500 text-white hover:bg-blue-600",
      icon: "fas fa-shopping-cart",
      label: "Flipkart"
    }
  };

  const config = platformConfig[product.platform as keyof typeof platformConfig];

  return (
    <div className="product-card bg-card border border-border rounded-xl overflow-hidden shadow-sm" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`;
            }}
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <i className="fas fa-image text-muted-foreground text-3xl"></i>
          </div>
        )}
        
        {product.discount && product.discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="discount-badge text-white px-2 py-1 rounded-md text-xs font-bold" data-testid={`text-discount-${product.id}`}>
              {product.discount}% OFF
            </span>
          </div>
        )}
        
        <div className="absolute top-3 left-3">
          <span className={`${config.color} px-2 py-1 rounded-md text-xs font-bold`} data-testid={`text-platform-${product.id}`}>
            {config.label}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-lg mb-2 line-clamp-2" data-testid={`text-title-${product.id}`}>
          {product.title}
        </h4>
        
        {product.category && (
          <span className="inline-block bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs font-medium mb-2" data-testid={`text-category-${product.id}`}>
            {product.category}
          </span>
        )}
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>
          {product.description || "No description available"}
        </p>
        
        {(product.salePrice || product.originalPrice) && (
          <div className="flex items-center justify-between mb-3">
            <div className="price-tag px-3 py-1 rounded-lg">
              {product.salePrice && (
                <span className="text-lg font-bold text-green-700" data-testid={`text-sale-price-${product.id}`}>
                  {formatPrice(product.salePrice)}
                </span>
              )}
              {product.originalPrice && product.originalPrice !== product.salePrice && (
                <span className="text-sm text-muted-foreground line-through ml-2" data-testid={`text-original-price-${product.id}`}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleViewProduct}
            className={`flex-1 ${config.buttonColor} text-sm font-medium transition-colors`}
            data-testid={`button-view-${product.id}`}
          >
            <i className={`${config.icon} mr-1`}></i>View on {config.label}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleRemove}
            disabled={deleteProductMutation.isPending}
            className="hover:bg-destructive hover:text-destructive-foreground"
            data-testid={`button-remove-${product.id}`}
          >
            <i className="fas fa-trash"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
