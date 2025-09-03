# Replit Agent Guide

## Overview

DealPro is a professional deals and discounts platform created by Ajay Farenziya. This full-stack web application enables users to discover the best deals on Amazon and Flipkart by automatically scraping and comparing product prices. The application features a React frontend with shadcn/ui components and an Express.js backend with web scraping capabilities, designed to help users find verified deals, genuine discounts, and compare prices across platforms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas shared between frontend and backend for consistent validation
- **Web Scraping**: Cheerio for HTML parsing and product data extraction from e-commerce sites
- **Development**: Hot module replacement with Vite integration for seamless full-stack development

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon for production reliability
- **ORM**: Drizzle ORM with migrations for database schema management
- **Schema Design**: Products table with fields for title, description, pricing, images, platform identification, and URLs
- **Development Fallback**: In-memory storage implementation for development environments

### Authentication and Authorization
- **Current State**: User schema defined but authentication not fully implemented
- **Planned**: Session-based authentication with PostgreSQL session storage using connect-pg-simple
- **Security**: Express middleware for request logging and error handling

### API Design
- **Architecture**: RESTful API with consistent error handling and JSON responses
- **Endpoints**: 
  - GET `/api/products` - Retrieve all products with sorting by creation date
  - GET `/api/products/:id` - Retrieve single product by ID
  - POST `/api/products/scrape` - Scrape and create product from URL
  - DELETE `/api/products/:id` - Remove product (planned)
- **Validation**: Zod schemas for request/response validation with proper error messages
- **Logging**: Custom middleware for API request/response logging with performance metrics

## External Dependencies

### Database Services
- **Neon**: PostgreSQL cloud database service for production data storage
- **Drizzle Kit**: Database migration and schema management tools

### Web Scraping
- **Cheerio**: Server-side HTML parsing for extracting product data from Amazon and Flipkart
- **Platform Support**: Currently supports Amazon (.in/.com) and Flipkart (.com) URLs with platform-specific scraping logic

### UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Modern icon library for consistent iconography
- **Google Fonts**: Custom font loading for improved typography

### Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development server
- **Replit Integration**: Development environment integration with runtime error overlays and cartographer