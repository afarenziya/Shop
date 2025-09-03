import { Link } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-tag text-primary text-2xl"></i>
              <h1 className="text-2xl font-bold text-primary">DealPro</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => scrollToSection("home")}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-home"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection("products")}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-products"
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection("add-product")}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-add-product"
              >
                Add Product
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="nav-about"
              >
                About
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => scrollToSection("add-product")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-add-product"
            >
              <i className="fas fa-plus mr-2"></i>Add Product
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
