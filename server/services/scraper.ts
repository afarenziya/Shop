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

    // Multiple selectors for current/sale price
    const salePriceText = $('.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen').text() ||
                         $('.a-price-current .a-offscreen').text() ||
                         $('.a-price.a-offscreen').first().text() ||
                         $('.a-price-whole').text() ||
                         $('[data-automation-id="price"]').text() ||
                         $('.a-text-price .a-offscreen').text() ||
                         '';

    // Multiple selectors for original price
    const originalPriceText = $('.a-price.a-text-strike .a-offscreen').text() ||
                             $('.a-price-was .a-offscreen').text() ||
                             $('.a-text-strike .a-offscreen').text() ||
                             $('[data-automation-id="was-price"]').text() ||
                             '';

    // Clean price values - handle both INR and $ formats
    const salePrice = salePriceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
    const originalPrice = originalPriceText.replace(/[^\d.,]/g, '').replace(/,/g, '');

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
    // Updated comprehensive selectors for Flipkart title
    let title = '';
    const titleSelectors = [
      '.B_NuCI', // Classic selector
      '._35KyD6', // Alternative classic
      'h1[class*="title"]', // Generic title
      '._6EBuvT', // Another classic
      'span.B_NuCI', // Span variant
      '.VU-ZEz', // Updated selector
      '.x-product-title-label', // New layout
      '._1AtVbE div[class*="col-"]', // New grid layout
      'h1._1AtVbE', // Header variant
      'span[class*="_1AtVbE"]', // Span variant
      'div[class*="B_NuCI"]', // Div variant
      'h1[data-automation-id="product-title"]',
      '.product-title',
      'h1[class*="_35KyD6"]',
      'span[class*="_35KyD6"]',
      'h1'
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

    // Updated selectors for Flipkart images - more comprehensive approach
    let imageUrl = '';
    
    // Try specific Flipkart image selectors
    const imageSelectors = [
      'img._53J4C-._2FaSu6', // Old selector
      'img._396cs4', // Common selector
      'img._2r_T1I', // Alternative selector
      'img[class*="_396cs4"]',
      'img[class*="_2r_T1I"]',
      'img[class*="_4WELSP"]', // Updated selector
      'img[class*="_2FaSu6"]', // Updated selector
      '._1BweW8 img',
      '._2upR2l img',
      '._3587i4 img',
      '.CXW8mj img',
      '._2nnSb9 img', // New selector
      '._1Nyybr img', // New selector
      '._3BTv9X img', // New selector
      '._2eqpOb img', // New selector
      'img[alt*="product"]',
      'img[data-automation-id="product-image"]',
      '._3BTv9X ._2FaSu6', // Nested selector
      'div[class*="image"] img',
      'figure img',
      '.q6DClP img' // Another common selector
    ];
    
    for (const selector of imageSelectors) {
      const img = $(selector).attr('src');
      if (img && !img.includes('placeholder') && !img.includes('default')) {
        imageUrl = img;
        break;
      }
    }
    
    // If still no image found, try data attributes
    if (!imageUrl) {
      for (const selector of imageSelectors) {
        const img = $(selector).attr('data-src') || $(selector).attr('data-lazy-src');
        if (img && !img.includes('placeholder') && !img.includes('default')) {
          imageUrl = img;
          break;
        }
      }
    }

    // Updated comprehensive selectors for Flipkart prices
    let salePriceText = '';
    let originalPriceText = '';
    
    // Current price selectors (more comprehensive)
    const salePriceSelectors = [
      '._30jeq3._16Jk6d', // Old selector
      '._3I9_wc._2p6lqe', // Alternative
      '._1_WHN1', // Alternative
      '._25b18c', // Alternative
      '._16Jk6d', // Generic
      '._2Y87o_ ._3I9_wc', // New layout
      '._1vC4OE ._3I9_wc', // Another layout
      '._5H1SUz ._3I9_wc', // Another layout
      '._3I9_wc', // Generic current price
      '._4b5DiR', // Another price selector
      '._1Y8a60', // Another price selector
      '.Nx9bqj.CxhGGd', // Updated selector
      '.Nx9bqj', // Simplified selector
      '.CxhGGd', // Another price selector
      '[data-automation-id="current-price"]',
      '.current-price'
    ];
    
    // Original/MRP price selectors
    const originalPriceSelectors = [
      '._3I9_wc._27UcVY', // Old selector
      '._2p6lqe', // Alternative
      '._3auQ3N', // Alternative
      '._3YN9BK ._2p6lqe', // Nested selector
      '._5Gpcqm ._2p6lqe', // Another nested
      '._27UcVY', // Generic original price
      '._1YaYEu', // Another original price selector
      '._5Gpcqm', // Container selector
      '.yRaY8j.ZYYwLA', // Updated selector
      '.yRaY8j', // Simplified selector
      '[data-automation-id="original-price"]',
      '.original-price',
      'span[style*="text-decoration: line-through"]', // Generic strikethrough
      'span[style*="line-through"]' // Another strikethrough
    ];
    
    // Try to find sale price
    for (const selector of salePriceSelectors) {
      const price = $(selector).text().trim();
      if (price && price.match(/₹|Rs|\d/)) {
        salePriceText = price;
        break;
      }
    }
    
    // Try to find original price
    for (const selector of originalPriceSelectors) {
      const price = $(selector).text().trim();
      if (price && price.match(/₹|Rs|\d/) && price !== salePriceText) {
        originalPriceText = price;
        break;
      }
    }

    // Clean price values - handle both INR format with commas
    const salePrice = salePriceText.replace(/[^\d.,]/g, '').replace(/,/g, '');
    const originalPrice = originalPriceText.replace(/[^\d.,]/g, '').replace(/,/g, '');

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
}
