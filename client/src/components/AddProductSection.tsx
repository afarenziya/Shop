import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { addProductUrlSchema, type AddProductUrl } from "@shared/schema";

export default function AddProductSection() {
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
    <section id="add-product" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-8">Add New Product</h3>
          <div className="bg-background border border-border rounded-xl p-8 shadow-lg">
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
                            className="w-full px-4 py-3 bg-card border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all pr-10"
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
                  <Loader2 className="w-4 h-4 animate-spin" />
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
        </div>
      </div>
    </section>
  );
}
