import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  title: string;
  description: string;
  imageUrl: string;
  originalPrice?: string;
  salePrice?: string;
  discount?: number;
  category?: string;
  platform: 'amazon' | 'flipkart';
  productUrl: string;
}

export class ProductScraper {
  private static isAmazonUrl(url: string): boolean {
    return url.includes('amazon.in') || url.includes('amazon.com');
  }

  private static isFlipkartUrl(url: string): boolean {
    return url.includes('flipkart.com');
  }

  public static async scrapeProduct(url: string): Promise<ScrapedProduct> {
    try {
      // console.log(`[SCRAPER] Starting scrape for: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch product page: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      if (this.isAmazonUrl(url)) {
        return this.scrapeAmazonProduct($, url);
      } else if (this.isFlipkartUrl(url)) {
        return this.scrapeFlipkartProduct($, url);
      } else {
        throw new Error('Unsupported platform. Only Amazon and Flipkart URLs are supported.');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static scrapeAmazonProduct($: cheerio.CheerioAPI, url: string): ScrapedProduct {
    // Multiple selectors for title to handle different page layouts
    const title = $('#productTitle').text().trim() || 
                  $('h1[id="title"]').text().trim() ||
                  $('span[id="productTitle"]').text().trim() ||
                  $('.product-title').text().trim() ||
                  $('[data-automation-id="product-title"]').text().trim() ||
                  $('h1.a-size-large').text().trim() ||
                  $('h1').first().text().trim() ||
                  'Product Title Not Found';

    // Multiple selectors for description
    const description = $('#feature-bullets ul li span').first().text().trim() ||
                       $('#feature-bullets ul li').first().text().trim() ||
                       $('.a-unordered-list .a-list-item').first().text().trim() ||
                       $('.product-bullets ul li').first().text().trim() ||
                       $('[data-automation-id="productDescription"]').text().trim() ||
                       $('.a-section .a-spacing-medium').first().text().trim() ||
                       'Description not available';

    // Multiple selectors for image
    const imageUrl = $('#landingImage').attr('src') ||
                    $('#landingImage').attr('data-src') ||
                    $('#imgBlkFront').attr('src') ||
                    $('.a-dynamic-image').first().attr('src') ||
                    $('.a-dynamic-image').first().attr('data-src') ||
                    $('img[data-old-hires]').attr('data-old-hires') ||
                    $('img[id*="image"]').first().attr('src') ||
                    '';

    // Enhanced Amazon price selectors - 2024/2025 updated
    let salePriceText = '';
    const salePriceSelectors = [
      // Latest Amazon price selectors
      '.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen',
      '.a-price-current .a-offscreen', 
      '.a-price .a-offscreen',
      '.a-price-whole',
      'span.a-price-whole',
      '.a-offscreen',
      '[data-automation-id="price"]',
      '.a-text-price .a-offscreen',
      // Additional fallback selectors
      '.a-price-range .a-offscreen',
      '#priceblock_dealprice',
      '#priceblock_ourprice', 
      '#price_inside_buybox',
      '.a-size-medium.a-color-price',
      '.a-price.a-text-normal .a-offscreen'
    ];
    
    for (const selector of salePriceSelectors) {
      const priceEl = $(selector).first();
      if (priceEl.length && priceEl.text().trim()) {
        salePriceText = priceEl.text().trim();
        break;
      }
    }
    
    if (!salePriceText) {
      $('.a-price').each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.includes('₹') || text.includes('$')) {
          salePriceText = text;
          return false; // break
        }
      });
    }

    // Enhanced Amazon original price selectors
    let originalPriceText = '';
    const originalPriceSelectors = [
      '.a-price.a-text-strike .a-offscreen',
      '.a-price-was .a-offscreen', 
      '.a-text-strike .a-offscreen',
      '[data-automation-id="was-price"]',
      '#price .a-text-strike .a-offscreen',
      '.a-price-old .a-offscreen'
    ];
    
    for (const selector of originalPriceSelectors) {
      const priceEl = $(selector).first();
      if (priceEl.length && priceEl.text().trim()) {
        originalPriceText = priceEl.text().trim();
        break;
      }
    }

    // Clean price values - handle both INR and $ formats
    const salePrice = this.cleanPrice(salePriceText);
    const originalPrice = this.cleanPrice(originalPriceText);

    // Calculate discount
    let discount = 0;
    if (originalPrice && salePrice) {
      const original = parseFloat(originalPrice);
      const sale = parseFloat(salePrice);
      if (original > sale && original > 0) {
        discount = Math.round(((original - sale) / original) * 100);
      }
    }

    // Extract category from breadcrumbs or page structure
    const categoryText = $('#wayfinding-breadcrumbs_feature_div li:nth-child(2) a').text().trim() ||
                        $('#wayfinding-breadcrumbs_feature_div li:nth-child(3) a').text().trim() ||
                        $('.a-breadcrumb li:nth-child(2) a').text().trim() ||
                        $('.nav-subnav a').first().text().trim() ||
                        '';

    // Clean up title - remove extra whitespace and newlines
    const cleanTitle = title.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
    const cleanDescription = description.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
    const category = this.categorizeProduct(cleanTitle, categoryText);

    return {
      title: cleanTitle || 'Product Title Not Found',
      description: cleanDescription || 'Description not available',
      imageUrl: imageUrl || '',
      originalPrice: originalPrice || undefined,
      salePrice: salePrice || undefined,
      discount: discount || undefined,
      category: category || undefined,
      platform: 'amazon',
      productUrl: url
    };
  }

  private static scrapeFlipkartProduct($: cheerio.CheerioAPI, url: string): ScrapedProduct {
    // Updated comprehensive selectors for Flipkart title with 2024/2025 selectors
    let title = '';
    const titleSelectors = [
      // 2024-2025 Updated selectors
      'span[class*="VU-ZEz"]', // New primary selector
      'h1[class*="VU-ZEz"]',  // Header variant
      'span.VU-ZEz',
      '.VU-ZEz',
      // Classic selectors
      '.B_NuCI', 
      '._35KyD6', 
      'h1[class*="title"]', 
      '._6EBuvT', 
      'span.B_NuCI', 
      '.x-product-title-label', 
      '._1AtVbE div[class*="col-"]', 
      'h1._1AtVbE', 
      'span[class*="_1AtVbE"]', 
      'div[class*="B_NuCI"]', 
      'h1[data-automation-id="product-title"]',
      '.product-title',
      'h1[class*="_35KyD6"]',
      'span[class*="_35KyD6"]',
      // Generic fallbacks
      'h1', 'h2'
    ];
    
    for (const selector of titleSelectors) {
      const titleText = $(selector).text().trim();
      if (titleText && titleText.length > 10 && !titleText.toLowerCase().includes('flipkart')) {
        title = titleText;
        break;
      }
    }

    // Updated comprehensive selectors for Flipkart description
    let description = '';
    const descriptionSelectors = [
      '._1mXcCf', // Classic selector
      '._3WHvuP', // Alternative classic
      '._4gvKMe', // Another classic
      '.product-description', // Generic
      '._2418kt', // Another classic
      '._1AN87F', // Updated selector
      '._1mXcCf._13RGX6', // More specific
      'div[class*="_1mXcCf"]', // Div variant
      'p[class*="_1mXcCf"]', // Paragraph variant
      '._3WHvuP div', // Nested content
      '[data-automation-id="product-description"]'
    ];
    
    for (const selector of descriptionSelectors) {
      const descText = $(selector).first().text().trim();
      if (descText && descText.length > 20) {
        description = descText;
        break;
      }
    }
    
    // Set fallback values if still empty
    if (!title) title = 'Product Title Not Found';
    if (!description) description = 'Description not available';

    // Updated comprehensive image selectors for Flipkart 2024/2025
    let imageUrl = '';
    
    const imageSelectors = [
      // 2024-2025 Updated image selectors
      'img[class*="_0DkuPH"]', // New primary image selector
      'img[class*="_53J4C-"]', // Updated variant  
      'img._53J4C-._2FaSu6', // Classic combo
      'img._396cs4', // Still common
      'img._2r_T1I', // Alternative
      'img[class*="_396cs4"]',
      'img[class*="_2r_T1I"]',
      'img[class*="_4WELSP"]',
      'img[class*="_2FaSu6"]',
      // Container-based selectors
      '._1BweW8 img', '._2upR2l img', '._3587i4 img', '.CXW8mj img',
      '._2nnSb9 img', '._1Nyybr img', '._3BTv9X img', '._2eqpOb img',
      'div[class*="_1AtVbE"] img', // New container
      // Generic selectors
      'img[alt*="product"]', 'img[data-automation-id="product-image"]',
      '._3BTv9X ._2FaSu6', 'div[class*="image"] img', 'figure img',
      '.q6DClP img', 'img[src*="rukminim"]' // Flipkart CDN specific
    ];
    
    for (const selector of imageSelectors) {
      const img = $(selector).attr('src');
      if (img && img.startsWith('http') && !img.includes('placeholder') && !img.includes('default')) {
        imageUrl = img;
        break;
      }
    }
    
    // If still no image found, try data attributes
    if (!imageUrl) {
      for (const selector of imageSelectors) {
        const img = $(selector).attr('data-src') || $(selector).attr('data-lazy-src') || $(selector).attr('data-original');
        if (img && img.startsWith('http') && !img.includes('placeholder') && !img.includes('default')) {
          imageUrl = img;
          break;
        }
      }
    }

    // Updated comprehensive selectors for Flipkart prices
    let salePriceText = '';
    let originalPriceText = '';
    
    // 2024-2025 Updated current price selectors
    const salePriceSelectors = [
      // Latest 2024-2025 selectors
      'div[class*="Nx9bqj"] span', // New layout price
      'span[class*="Nx9bqj"]', // Direct span selector
      'div[class*="_30jeq3"] span', // Updated container
      // Classic working selectors
      '._30jeq3._16Jk6d', 
      '._3I9_wc._2p6lqe', 
      '._1_WHN1', 
      '._25b18c', 
      '._16Jk6d', 
      // Container-based selectors
      '._2Y87o_ ._3I9_wc', 
      '._1vC4OE ._3I9_wc', 
      '._5H1SUz ._3I9_wc', 
      '._3I9_wc', 
      '._4b5DiR', 
      '._1Y8a60', 
      // Updated selectors
      '.Nx9bqj.CxhGGd', 
      '.Nx9bqj', 
      '.CxhGGd',
      'div[class*="CxhGGd"]',
      // Generic fallbacks
      '[data-automation-id="current-price"]',
      '.current-price'
    ];
    
    // 2024-2025 Updated original/MRP price selectors
    const originalPriceSelectors = [
      // Latest 2024-2025 selectors
      'div[class*="yRaY8j"] span', // New layout MRP
      'span[class*="yRaY8j"]', // Direct span selector
      'div[class*="_3I9_wc"][class*="_27UcVY"]', // Updated combo
      // Classic working selectors
      '._3I9_wc._27UcVY', 
      '._2p6lqe', 
      '._3auQ3N', 
      // Nested selectors
      '._3YN9BK ._2p6lqe', 
      '._5Gpcqm ._2p6lqe', 
      '._27UcVY', 
      '._1YaYEu', 
      '._5Gpcqm', 
      // Updated selectors
      '.yRaY8j.ZYYwLA', 
      '.yRaY8j', 
      'div[class*="ZYYwLA"]',
      // Generic fallbacks
      '[data-automation-id="original-price"]',
      '.original-price',
      'span[style*="text-decoration: line-through"]', 
      'span[style*="line-through"]',
      '.line-through' // Generic class
    ];
    
    // Try to find sale price - get first element only
    for (const selector of salePriceSelectors) {
      const priceEl = $(selector).first();
      if (priceEl.length) {
        const price = priceEl.text().trim();
        if (price && price.match(/₹|Rs|\d/)) {
          salePriceText = price;
          break;
        }
      }
    }
    
    // Try to find original price - get first element only
    for (const selector of originalPriceSelectors) {
      const priceEl = $(selector).first();
      if (priceEl.length) {
        const price = priceEl.text().trim();
        if (price && price.match(/₹|Rs|\d/) && price !== salePriceText) {
          originalPriceText = price;
          break;
        }
      }
    }

    // Clean price values - handle both INR format with commas
    const salePrice = this.cleanPrice(salePriceText);
    const originalPrice = this.cleanPrice(originalPriceText);

    // Multiple selectors for discount percentage
    const discountText = $('._3Ay6Sb._31Dcoz').text() ||
                        $('._3I9_wc._1_WHN1').text() ||
                        $('._3Ay6Sb').text() ||
                        $('._1UhVsV').text() ||
                        $('[data-automation-id="discount"]').text() ||
                        $('.discount-percent').text() ||
                        '';
    
    let discount = 0;
    const discountMatch = discountText.match(/(\d+)%/);
    if (discountMatch) {
      discount = parseInt(discountMatch[1]);
    } else if (originalPrice && salePrice) {
      // Calculate discount if not explicitly shown
      const original = parseFloat(originalPrice);
      const sale = parseFloat(salePrice);
      if (original > sale && original > 0) {
        discount = Math.round(((original - sale) / original) * 100);
      }
    }

    // Extract category from breadcrumbs
    const categoryText = $('._1HEvpc').text().trim() ||
                        $('._2whP9R').text().trim() ||
                        $('.breadcrumb li:nth-child(2)').text().trim() ||
                        '';

    // Clean up title and description - remove extra whitespace and newlines
    const cleanTitle = title.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
    const cleanDescription = description.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
    const category = this.categorizeProduct(cleanTitle, categoryText);

    return {
      title: cleanTitle || 'Product Title Not Found',
      description: cleanDescription || 'Description not available',
      imageUrl: imageUrl || '',
      originalPrice: originalPrice || undefined,
      salePrice: salePrice || undefined,
      discount: discount || undefined,
      category: category || undefined,
      platform: 'flipkart',
      productUrl: url
    };
  }

  private static categorizeProduct(title: string, categoryText: string): string {
    const titleLower = title.toLowerCase();
    const categoryLower = categoryText.toLowerCase();
    
    // Category keywords mapping
    const categoryMap = [
      { keywords: ['mobile', 'phone', 'smartphone', 'iphone', 'samsung', 'oneplus', 'oppo', 'vivo', 'mi', 'redmi'], category: 'Mobile & Electronics' },
      { keywords: ['laptop', 'computer', 'desktop', 'macbook', 'dell', 'hp', 'asus', 'lenovo'], category: 'Computers & Laptops' },
      { keywords: ['headphone', 'earphone', 'speaker', 'audio', 'music', 'sound', 'bluetooth'], category: 'Audio & Headphones' },
      { keywords: ['camera', 'photo', 'video', 'lens', 'canon', 'nikon', 'sony'], category: 'Camera & Photography' },
      { keywords: ['watch', 'smartwatch', 'fitness', 'tracker', 'band', 'apple watch'], category: 'Watches & Fitness' },
      { keywords: ['clothing', 'shirt', 'tshirt', 't-shirt', 'dress', 'jeans', 'trouser', 'jacket', 'hoodie', 'sweater'], category: 'Fashion & Clothing' },
      { keywords: ['shoe', 'sneaker', 'boots', 'sandal', 'footwear', 'nike', 'adidas', 'puma'], category: 'Footwear' },
      { keywords: ['bag', 'backpack', 'handbag', 'wallet', 'purse', 'luggage', 'suitcase'], category: 'Bags & Luggage' },
      { keywords: ['book', 'novel', 'textbook', 'magazine', 'kindle', 'ebook'], category: 'Books & Media' },
      { keywords: ['toy', 'game', 'puzzle', 'doll', 'action figure', 'lego'], category: 'Toys & Games' },
      { keywords: ['home', 'kitchen', 'furniture', 'chair', 'table', 'bed', 'sofa'], category: 'Home & Kitchen' },
      { keywords: ['beauty', 'cosmetic', 'skincare', 'makeup', 'perfume', 'shampoo', 'soap'], category: 'Beauty & Personal Care' },
      { keywords: ['health', 'vitamin', 'supplement', 'medicine', 'protein', 'fitness'], category: 'Health & Wellness' },
      { keywords: ['car', 'bike', 'automotive', 'motorcycle', 'vehicle', 'accessories'], category: 'Automotive' },
      { keywords: ['sport', 'gym', 'exercise', 'cricket', 'football', 'basketball', 'tennis'], category: 'Sports & Fitness' }
    ];

    // Check category text first
    if (categoryText) {
      for (const cat of categoryMap) {
        if (cat.keywords.some(keyword => categoryLower.includes(keyword))) {
          return cat.category;
        }
      }
    }

    // Check title for keywords
    for (const cat of categoryMap) {
      if (cat.keywords.some(keyword => titleLower.includes(keyword))) {
        return cat.category;
      }
    }

    return 'General';
  }

  private static cleanPrice(priceText: string): string | undefined {
    if (!priceText) return undefined;
    
    // Remove all non-numeric characters except dots and commas first
    let cleaned = priceText.replace(/[^\d.,]/g, '');
    
    // Handle different price formats
    let numericPrice = 0;
    
    // Indian format: 1,34,567.89 or 1,34,567
    if (cleaned.includes(',')) {
      // For Indian numbering, remove all commas
      const withoutCommas = cleaned.replace(/,/g, '');
      numericPrice = parseFloat(withoutCommas);
    } else {
      // Simple format: 134567.89 or 134567
      numericPrice = parseFloat(cleaned);
    }
    
    // Basic validation: price should be between 1 and 50,00,000 (50 lakh)
    if (isNaN(numericPrice) || numericPrice < 1 || numericPrice > 5000000) {
      return undefined;
    }
    
    // Return as string with max 2 decimal places
    return numericPrice.toFixed(2);
  }
}
