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
    // Multiple selectors for title to handle different Flipkart layouts
    const title = $('.B_NuCI').text().trim() ||
                  $('._35KyD6').text().trim() ||
                  $('h1[class*="title"]').text().trim() ||
                  $('._6EBuvT').text().trim() ||
                  $('span.B_NuCI').text().trim() ||
                  $('h1[data-automation-id="product-title"]').text().trim() ||
                  $('.product-title').text().trim() ||
                  $('h1').first().text().trim() ||
                  'Product Title Not Found';

    // Multiple selectors for description
    const description = $('._1mXcCf').first().text().trim() ||
                       $('._3WHvuP').first().text().trim() ||
                       $('._4gvKMe').first().text().trim() ||
                       $('.product-description').first().text().trim() ||
                       $('._2418kt').first().text().trim() ||
                       $('[data-automation-id="product-description"]').text().trim() ||
                       'Description not available';

    // Multiple selectors for image - updated for current Flipkart layout
    const imageUrl = $('img._53J4C-._2FaSu6').attr('src') ||
                    $('img._396cs4').attr('src') ||
                    $('img._2r_T1I').attr('src') ||
                    $('img[class*="_396cs4"]').attr('src') ||
                    $('._1BweW8 img').attr('src') ||
                    $('._2upR2l img').attr('src') ||
                    $('._3587i4 img').attr('src') ||
                    $('.CXW8mj img').attr('src') ||
                    $('img[alt*="product"]').first().attr('src') ||
                    $('img[data-automation-id="product-image"]').attr('src') ||
                    $('img').first().attr('src') ||
                    '';

    // Multiple selectors for sale price  
    const salePriceText = $('._30jeq3._16Jk6d').text() ||
                         $('._3I9_wc._2p6lqe').text() ||
                         $('._1_WHN1').text() ||
                         $('._25b18c').text() ||
                         $('._16Jk6d').text() ||
                         $('[data-automation-id="current-price"]').text() ||
                         $('.current-price').text() ||
                         '';

    // Multiple selectors for original price
    const originalPriceText = $('._3I9_wc._27UcVY').text() ||
                             $('._2p6lqe').text() ||
                             $('._3auQ3N').text() ||
                             $('[data-automation-id="original-price"]').text() ||
                             $('.original-price').text() ||
                             '';

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
