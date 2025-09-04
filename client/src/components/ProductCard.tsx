import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {

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
    <div className="product-card bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]" data-testid={`card-product-${product.id}`}>
      <div className="relative bg-white">
        {product.imageUrl ? (
          <div className="aspect-square bg-white p-4 flex items-center justify-center overflow-hidden group">
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-105"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300`;
              }}
            />
          </div>
        ) : (
          <div className="aspect-square bg-white flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-image text-gray-300 text-4xl mb-2"></i>
              <p className="text-xs text-gray-500">No Image</p>
            </div>
          </div>
        )}
        
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg" data-testid={`text-discount-${product.id}`}>
              {product.discount}% OFF
            </span>
          </div>
        )}
        
        <div className="absolute top-2 left-2 z-10">
          <span className={`${config.color} px-2 py-1 rounded-full text-xs font-bold shadow-md`} data-testid={`text-platform-${product.id}`}>
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
            className={`w-full ${config.buttonColor} text-sm font-medium transition-colors`}
            data-testid={`button-view-${product.id}`}
          >
            <i className={`${config.icon} mr-2`}></i>View on {config.label}
          </Button>
        </div>
      </div>
    </div>
  );
}
