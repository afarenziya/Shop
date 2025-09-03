import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToAddProduct = () => {
    const element = document.getElementById("add-product");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="home" className="bg-gradient-to-br from-primary/5 to-accent/5 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Find Best Deals & Discounts
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover verified deals on Amazon & Flipkart with instant price comparison. 
            Created by Ajay Farenziya, your trusted source for genuine discounts and best prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={scrollToAddProduct}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4"
              data-testid="button-get-started"
            >
              <i className="fas fa-rocket mr-2"></i>Get Started Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border border-border bg-card text-card-foreground hover:bg-secondary text-lg px-8 py-4"
              data-testid="button-watch-demo"
            >
              <i className="fas fa-play mr-2"></i>Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
