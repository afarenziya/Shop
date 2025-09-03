import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ProductScraper } from "./services/scraper";
import { addProductUrlSchema, insertProductSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Scrape and add product from URL
  app.post("/api/products/scrape", async (req, res) => {
    try {
      const { url } = addProductUrlSchema.parse(req.body);
      
      // Validate supported platforms
      const isAmazon = url.includes('amazon.in') || url.includes('amazon.com');
      const isFlipkart = url.includes('flipkart.com');
      
      if (!isAmazon && !isFlipkart) {
        return res.status(400).json({ 
          message: "Unsupported platform. Only Amazon and Flipkart URLs are supported." 
        });
      }

      // Scrape product data
      const scrapedData = await ProductScraper.scrapeProduct(url);
      
      // Validate and create product
      const productData = insertProductSchema.parse(scrapedData);
      const product = await storage.createProduct(productData);
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error scraping product:", error);
      if (error instanceof Error) {
        if (error.message.includes("Failed to scrape")) {
          return res.status(400).json({ message: error.message });
        }
        if (error.message.includes("validation")) {
          return res.status(400).json({ message: "Invalid URL format" });
        }
      }
      res.status(500).json({ message: "Failed to process product URL" });
    }
  });

  // Delete product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
