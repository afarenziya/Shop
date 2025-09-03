export default function Footer() {
  const quickLinks = ["Home", "Products", "Add Product", "Analytics", "Help"];
  const supportLinks = ["Documentation", "API Reference", "Contact Us", "Privacy Policy", "Terms of Service"];
  const socialLinks = [
    { icon: "fab fa-twitter", href: "#" },
    { icon: "fab fa-facebook", href: "#" },
    { icon: "fab fa-instagram", href: "#" },
    { icon: "fab fa-linkedin", href: "#" }
  ];

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-link text-primary text-2xl"></i>
              <h4 className="text-2xl font-bold">AffiliateHub</h4>
            </div>
            <p className="text-background/80 mb-4 max-w-md">
              The easiest way to create beautiful affiliate product showcases from Amazon and Flipkart links. 
              Start earning more with better product presentations.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="text-background/60 hover:text-primary transition-colors"
                  data-testid={`link-social-${index}`}
                >
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2 text-background/80">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="hover:text-primary transition-colors"
                    data-testid={`link-quick-${index}`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-background/80">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href="#" 
                    className="hover:text-primary transition-colors"
                    data-testid={`link-support-${index}`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
          <p>&copy; 2024 AffiliateHub. All rights reserved. Built with ❤️ for affiliate marketers.</p>
        </div>
      </div>
    </footer>
  );
}
