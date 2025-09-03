import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  title: string;
  description: string;
  imageUrl: string;
  originalPrice?: string;
  salePrice?: string;
  discount?: number;
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
    const title = $('#productTitle').text().trim() || 
                  $('span[data-automation-id="product-title"]').text().trim() ||
                  $('h1.a-size-large').text().trim() ||
                  'Product Title Not Found';

    const description = $('#feature-bullets ul li span').first().text().trim() ||
                       $('.a-unordered-list .a-list-item').first().text().trim() ||
                       'Description not available';

    const imageUrl = $('#landingImage').attr('src') ||
                    $('#imgBlkFront').attr('src') ||
                    $('.a-dynamic-image').first().attr('src') ||
                    '';

    const priceWhole = $('.a-price.a-text-price.a-size-medium.apexPriceToPay .a-offscreen').text() ||
                      $('.a-price-current .a-offscreen').text() ||
                      $('.a-price .a-offscreen').first().text() ||
                      '';

    const originalPriceText = $('.a-price.a-text-strike .a-offscreen').text() ||
                             $('.a-price-was .a-offscreen').text() ||
                             '';

    // Clean price values
    const salePrice = priceWhole.replace(/[^\d.,]/g, '');
    const originalPrice = originalPriceText.replace(/[^\d.,]/g, '');

    // Calculate discount
    let discount = 0;
    if (originalPrice && salePrice) {
      const original = parseFloat(originalPrice.replace(',', ''));
      const sale = parseFloat(salePrice.replace(',', ''));
      if (original > sale) {
        discount = Math.round(((original - sale) / original) * 100);
      }
    }

    return {
      title,
      description,
      imageUrl,
      originalPrice: originalPrice || undefined,
      salePrice: salePrice || undefined,
      discount: discount || undefined,
      platform: 'amazon',
      productUrl: url
    };
  }

  private static scrapeFlipkartProduct($: cheerio.CheerioAPI, url: string): ScrapedProduct {
    const title = $('.B_NuCI').text().trim() ||
                  $('h1[class*="title"]').text().trim() ||
                  $('._35KyD6').text().trim() ||
                  'Product Title Not Found';

    const description = $('._1mXcCf').first().text().trim() ||
                       $('._3WHvuP').first().text().trim() ||
                       'Description not available';

    const imageUrl = $('img._396cs4').attr('src') ||
                    $('img[class*="image"]').first().attr('src') ||
                    '';

    const salePriceText = $('._30jeq3._16Jk6d').text() ||
                         $('._3I9_wc._2p6lqe').text() ||
                         $('._1_WHN1').text() ||
                         '';

    const originalPriceText = $('._3I9_wc._27UcVY').text() ||
                             $('._2p6lqe').text() ||
                             '';

    // Clean price values
    const salePrice = salePriceText.replace(/[^\d.,]/g, '');
    const originalPrice = originalPriceText.replace(/[^\d.,]/g, '');

    // Extract discount percentage
    const discountText = $('._3Ay6Sb._31Dcoz').text() ||
                        $('._3I9_wc._1_WHN1').text() ||
                        '';
    
    let discount = 0;
    const discountMatch = discountText.match(/(\d+)%/);
    if (discountMatch) {
      discount = parseInt(discountMatch[1]);
    }

    return {
      title,
      description,
      imageUrl,
      originalPrice: originalPrice || undefined,
      salePrice: salePrice || undefined,
      discount: discount || undefined,
      platform: 'flipkart',
      productUrl: url
    };
  }
}
