import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { addProductUrlSchema, type AddProductUrl } from "@shared/schema";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SocialButtons from "@/components/SocialButtons";

export default function AddProduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddProductUrl>({
    resolver: zodResolver(addProductUrlSchema),
    defaultValues: {
      url: "",
    },
  });

  const scrapeProductMutation = useMutation({
    mutationFn: async (data: AddProductUrl) => {
      const response = await apiRequest("POST", "/api/products/scrape", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Added Successfully",
        description: "The product has been fetched and added to your collection.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Product",
        description: error.message || "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddProductUrl) => {
    scrapeProductMutation.mutate(data);
  };

  const handleClear = () => {
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo */}
            <div>
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" data-testid="logo-link">
                <i className="fas fa-shopping-cart text-primary text-2xl"></i>
                <h1 className="text-2xl font-bold text-primary">AffiliateHub</h1>
              </Link>
            </div>
            
            {/* Center - Navigation Menu */}
            <div className="flex items-center space-x-6">
              <Link to="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <i className="fas fa-plus text-primary text-xl"></i>
                <span className="text-xl font-bold text-primary">Add Product</span>
              </div>
              <Link to="/home">
                <Button variant="ghost" data-testid="nav-home">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
            
            {/* Right side - Empty for balance */}
            <div className="w-[120px]"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Add New Product</h2>
            <p className="text-muted-foreground">
              Paste an Amazon or Flipkart product URL to automatically fetch all product details
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">Product Link</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Paste Amazon or Flipkart product URL here..."
                            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all pr-10"
                            data-testid="input-product-url"
                            {...field}
                          />
                          <i className="fas fa-link absolute right-3 top-3.5 text-muted-foreground"></i>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Supported: Amazon.in, Amazon.com, Flipkart.com product pages
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={scrapeProductMutation.isPending}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-3"
                    data-testid="button-fetch-product"
                  >
                    {scrapeProductMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <i className="fas fa-download mr-2"></i>
                    )}
                    {scrapeProductMutation.isPending ? "Fetching..." : "Fetch Product Details"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={handleClear}
                    className="px-6 py-3"
                    data-testid="button-clear"
                  >
                    <i className="fas fa-trash mr-2"></i>Clear
                  </Button>
                </div>
              </form>
            </Form>
            
            {scrapeProductMutation.isPending && (
              <div className="mt-8">
                <div className="flex items-center justify-center space-x-3 text-muted-foreground">
                  <Loader2 className="w-4 w-4 animate-spin" />
                  <span>Fetching product details...</span>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="loading-skeleton h-4 rounded w-3/4"></div>
                  <div className="loading-skeleton h-20 rounded"></div>
                  <div className="loading-skeleton h-4 rounded w-1/2"></div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">How it works:</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Copy a product URL from Amazon or Flipkart</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Paste it in the input field above</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Click "Fetch Product Details" to automatically extract all information</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>The product will be added to your store with category, images, and pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <ScrollToTop />
      <SocialButtons />
    </div>
  );
}