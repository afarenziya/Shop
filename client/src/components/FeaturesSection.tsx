export default function FeaturesSection() {
  const features = [
    {
      icon: "fas fa-wand-magic-sparkles",
      color: "bg-primary/10 text-primary",
      title: "Auto Product Fetch",
      description: "Simply paste any Amazon or Flipkart product URL and get all details automatically extracted including images, prices, and descriptions."
    },
    {
      icon: "fas fa-mobile-screen",
      color: "bg-accent/10 text-accent",
      title: "Mobile Responsive",
      description: "Your affiliate site looks perfect on all devices. Optimized for mobile, tablet, and desktop viewing experiences."
    },
    {
      icon: "fas fa-chart-line",
      color: "bg-green-500/10 text-green-500",
      title: "Track Performance",
      description: "Monitor clicks, conversions, and earnings with built-in analytics. Optimize your affiliate marketing strategy with data."
    },
    {
      icon: "fas fa-shield",
      color: "bg-purple-500/10 text-purple-500",
      title: "Secure & Reliable",
      description: "Enterprise-grade security with reliable uptime. Your affiliate links and data are always protected and accessible."
    },
    {
      icon: "fas fa-bolt-lightning",
      color: "bg-blue-500/10 text-blue-500",
      title: "Lightning Fast",
      description: "Optimized for speed with instant product fetching and fast loading times. Better user experience means higher conversions."
    },
    {
      icon: "fas fa-cogs",
      color: "bg-red-500/10 text-red-500",
      title: "Easy Customization",
      description: "Customize product displays, layouts, and branding to match your style. No coding knowledge required for basic customizations."
    }
  ];

  return (
    <section id="about" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Why Choose AffiliateHub?</h3>
          <p className="text-lg text-muted-foreground">Powerful features to boost your affiliate marketing success</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6" data-testid={`feature-${index}`}>
              <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <i className={`${feature.icon} text-2xl`}></i>
              </div>
              <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
