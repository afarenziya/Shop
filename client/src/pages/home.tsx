import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SocialButtons from "@/components/SocialButtons";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border">
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
              <Link to="/">
                <Button variant="ghost" data-testid="nav-browse">
                  Browse Products
                </Button>
              </Link>
            </div>
            
            {/* Right side - Contact */}
            <div>
              <Button variant="outline" onClick={() => window.open('mailto:afarenziya@gmail.com', '_blank')} data-testid="nav-contact">
                <i className="fas fa-envelope mr-2"></i>Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Find Best Deals & Discounts
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Created by Ajay Farenziya - The easiest way to find verified deals on Amazon & Flipkart. 
              Compare prices, discover genuine discounts, and never miss a great deal again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/">
                <Button 
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4"
                  data-testid="button-browse-products"
                >
                  <i className="fas fa-shopping-cart mr-2"></i>Browse Products
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open('mailto:afarenziya@gmail.com?subject=DealPro%20Partnership', '_blank')}
                className="border border-border bg-card text-card-foreground hover:bg-secondary text-lg px-8 py-4"
                data-testid="button-contact-hero"
              >
                <i className="fas fa-handshake mr-2"></i>Partner With Us
              </Button>
            </div>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2 Platforms</div>
                <p className="text-muted-foreground">Amazon & Flipkart Support</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Auto Extract</div>
                <p className="text-muted-foreground">Product Information</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">15+ Categories</div>
                <p className="text-muted-foreground">Smart Categorization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <Footer />
      <ScrollToTop />
      <SocialButtons />
    </div>
  );
}
