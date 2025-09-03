import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SocialButtons() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const openWhatsApp = () => {
    const message = encodeURIComponent("Hello! I'm interested in AffiliateHub platform.");
    window.open(`https://wa.me/+919999999999?text=${message}`, "_blank");
  };

  const socialLinks = [
    {
      name: "YouTube",
      icon: "fab fa-youtube",
      url: "https://youtube.com/@ajayfarenziya",
      color: "text-red-600 hover:text-red-700"
    },
    {
      name: "Instagram", 
      icon: "fab fa-instagram",
      url: "https://instagram.com/ajayfarenziya",
      color: "text-pink-600 hover:text-pink-700"
    },
    {
      name: "Facebook",
      icon: "fab fa-facebook",
      url: "https://facebook.com/ajayfarenziya", 
      color: "text-blue-600 hover:text-blue-700"
    }
  ];

  return (
    <div className="fixed left-4 bottom-4 z-50 flex flex-col space-y-2">
      {/* WhatsApp Toggle Button */}
      <Button
        onClick={openWhatsApp}
        className="bg-green-600 text-white hover:bg-green-700 rounded-full p-3 shadow-lg"
        size="sm"
        data-testid="whatsapp-button"
      >
        <i className="fab fa-whatsapp text-xl"></i>
      </Button>
      
      {/* Social Media Quick Access */}
      <div className="flex flex-col space-y-2">
        {socialLinks.map((social, index) => (
          <Button
            key={index}
            onClick={() => window.open(social.url, "_blank")}
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-md"
            size="sm"
            data-testid={`social-${social.name.toLowerCase()}`}
          >
            <i className={`${social.icon} ${social.color} text-lg`}></i>
          </Button>
        ))}
      </div>
    </div>
  );
}