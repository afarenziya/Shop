import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AddProductSection from "@/components/AddProductSection";
import ProductsGrid from "@/components/ProductsGrid";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <AddProductSection />
      <ProductsGrid />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
