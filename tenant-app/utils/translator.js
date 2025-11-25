// Translation utility using Google Translate API
// This provides automatic translation from English to Amharic

class TranslationService {
  constructor() {
    this.cache = new Map(); // Cache translations to avoid repeated API calls
    this.isTranslating = new Set(); // Track ongoing translations
  }

  // Simple translation using Google Translate (free tier)
  async translateText(text, targetLang = 'am') {
    if (!text || targetLang === 'en') return text;

    const cacheKey = `${text}_${targetLang}`;

    // Return cached translation if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Avoid duplicate API calls for the same text
    if (this.isTranslating.has(cacheKey)) {
      // Wait for ongoing translation
      return new Promise((resolve) => {
        const checkCache = () => {
          if (this.cache.has(cacheKey)) {
            resolve(this.cache.get(cacheKey));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.isTranslating.add(cacheKey);

    try {
      // First try fallback translation for immediate response
      const fallbackText = this.fallbackTranslate(text);

      // If fallback translation is different from original, use it
      if (fallbackText !== text) {
        this.cache.set(cacheKey, fallbackText);
        this.isTranslating.delete(cacheKey);
        return fallbackText;
      }

      // Only use API for texts not in our fallback dictionary
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|am`, {
        timeout: 5000 // 5 second timeout
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      let translatedText = fallbackText; // use fallback as default

      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        translatedText = data.responseData.translatedText;
      }

      // Cache the result
      this.cache.set(cacheKey, translatedText);
      this.isTranslating.delete(cacheKey);

      return translatedText;
    } catch (error) {
      console.warn('Translation API failed, using fallback:', error);
      this.isTranslating.delete(cacheKey);

      // Use fallback translation
      const fallbackText = this.fallbackTranslate(text);
      this.cache.set(cacheKey, fallbackText);
      return fallbackText;
    }
  }

  // Fallback translation using predefined mappings
  fallbackTranslate(text) {
    const translations = {
      // Categories
      "Main Dishes": "ዋና ምግቦች",
      "Appetizers": "ቅድመ ምግቦች",
      "Desserts": "ጣፋጭ ምግቦች",
      "Beverages": "መጠጦች",
      "Drinks": "መጠጦች",
      "Starters": "ቅድመ ምግቦች",
      "Salads": "ሰላጣዎች",
      "Soups": "ሾርባዎች",
      "Pizza": "ፒዛ",
      "Pasta": "ፓስታ",
      "Burgers": "በርገር",
      "Sandwiches": "ሳንድዊች",
      "Chicken": "ዶሮ",
      "Beef": "የበሬ ሥጋ",
      "Fish": "ዓሳ",
      "Vegetarian": "የቬጀቴሪያን",
      "Specials": "ልዩ ምግቦች",
      "Coffee": "ቡና",
      "Tea": "ሻይ",
      "Juice": "ጁስ",
      "Water": "ውሃ",
      "Soft Drinks": "ለስላሳ መጠጦች",
      "Breakfast": "ቁርስ",
      "Lunch": "ምሳ",
      "Dinner": "እራት",
      "Snacks": "መክሰስ",
      "Sides": "ተጨማሪ ምግቦች",

      // Common food terms
      "Grilled": "በእሳት የተጠበሰ",
      "Fried": "የተጠበሰ",
      "Roasted": "የተጠበሰ",
      "Baked": "በምድጃ የተጠበሰ",
      "Steamed": "በእንፋሎት የተበሰለ",
      "Boiled": "የተበሰለ",
      "Fresh": "ትኩስ",
      "Spicy": "ቅመም ያለበት",
      "Hot": "ሞቃት",
      "Cold": "ቀዝቃዛ",
      "Warm": "ሞቃታማ",
      "Large": "ትልቅ",
      "Medium": "መካከለኛ",
      "Small": "ትንሽ",
      "Extra Large": "በጣም ትልቅ",
      "Regular": "መደበኛ",
      "Special": "ልዩ",
      "Traditional": "ባህላዊ",
      "Classic": "ክላሲክ",
      "Delicious": "ጣፋጭ",
      "Popular": "ተወዳጅ",
      "New": "አዲስ",
      "Recommended": "የሚመከር",
      "Best Seller": "ምርጥ ሽያጭ",
      "Chef's Choice": "ሼፍ ምርጫ",

      // Prepositions and connectors
      "with": "ከ",
      "and": "እና",
      "or": "ወይም",
      "in": "በ",
      "on": "ላይ",
      "for": "ለ",
      "of": "የ",
      "the": "",
      "a": "",
      "an": "",

      // Serving terms
      "Served": "የሚቀርብ",
      "Served with": "የሚቀርብ ከ",
      "Comes with": "ይመጣል ከ",
      "Includes": "ያካትታል",
      "Mixed": "የተቀላቀለ",
      "Combo": "ኮምቦ",
      "Plate": "ሳህን",
      "Bowl": "ጎድጓዳ ሳህን",
      "Cup": "ኩባያ",
      "Glass": "ብርጭቆ",
      "Bottle": "ጠርሙስ",
      "Piece": "ቁራጭ",
      "Pieces": "ቁራጮች",
      "Slice": "ቁራጭ",
      "Slices": "ቁራጮች",

      // Ingredients
      "Rice": "ሩዝ",
      "Bread": "ዳቦ",
      "Meat": "ሥጋ",
      "Vegetables": "አትክልት",
      "Sauce": "ሾርባ",
      "Cheese": "አይብ",
      "Egg": "እንቁላል",
      "Eggs": "እንቁላሎች",
      "Onion": "ሽንኩርት",
      "Onions": "ሽንኩርቶች",
      "Tomato": "ቲማቲም",
      "Potato": "ድንች",
      "Garlic": "ነጭ ሽንኩርት",
      "Pepper": "በርበሬ",
      "Peppers": "በርበሬዎች",
      "Salt": "ጨው",
      "Oil": "ዘይት",
      "Butter": "ቅቤ",
      "Milk": "ወተት",
      "Cream": "ክሬም",
      "Lemon": "ሎሚ",
      "Lime": "ሎሚ",
      "Beans": "ባቄላ",
      "Lentils": "ምስር",
      "Injera": "እንጀራ",
      "Berbere": "በርበሬ",
      "Mitmita": "ሚጥሚጣ",
      "Honey": "ማር",
      "Wine": "ወይን",

      // Common adjectives
      "Crispy": "ጥርጣሬ",
      "Tender": "ለስላሳ",
      "Juicy": "ጭማቂ ያለበት",
      "Sweet": "ጣፋጭ",
      "Sour": "ኮሳሳ",
      "Bitter": "መራራ",
      "Salty": "ጨዋማ",
      "Creamy": "ክሬማማ",
      "Crunchy": "ጥርጣሬ",
      "Smooth": "ለስላሳ",
      "Rich": "የበለጸገ",
      "Light": "ቀላል",
      "Heavy": "ከባድ",
      "Healthy": "ጤናማ",
      "Organic": "ኦርጋኒክ",
      "Natural": "ተፈጥሯዊ",
      "Assorted": "የተለያዩ",
      "Seasonal": "ወቅታዊ",
      "Freshly": "በትኩስ",
      "Hard-boiled": "በደንብ የተበሰለ",
      "Sautéed": "በቅቤ የተጠበሰ",

      // Ethiopian specific terms
      "Ethiopian": "ኢትዮጵያዊ",
      "Traditional": "ባህላዊ",
      "Ceremony": "ሥነ ሥርዓት",
      "Stew": "ወጥ",
      "Tartare": "ጥሬ ሥጋ",
      "Seasoned": "በቅመም የተቀመመ",
      "Filled": "የተሞላ",
      "Made": "የተሰራ",
      "Pastry": "ዳቦ",
      "Cake": "ኬክ",
      "Spice": "ቅመም",
      "Dishes": "ምግቦች",
      "Lamb": "የበግ ሥጋ",
      "Steak": "ስቴክ",

      // Complete phrases from your examples
      "hard-boiled eggs": "በደንብ የተበሰሉ እንቁላሎች",
      "berbere spice": "በርበሬ ቅመም",
      "steak tartare": "ጥሬ ስቴክ",
      "seasoned with": "የተቀመመ በ",
      "served with": "የሚቀርብ ከ",
      "served on": "የሚቀርብ ላይ",
      "filled with": "የተሞላ በ",
      "made with": "የተሰራ በ",
      "coffee ceremony": "የቡና ሥነ ሥርዓት",
      "freshly roasted": "በትኩስ የተጠበሰ",
      "honey wine": "የማር ወይን",
      "fruit juices": "የፍራፍሬ ጭማቂዎች",
      "vegetarian dishes": "የቬጀቴሪያን ምግቦች",
      "injera bread": "እንጀራ ዳቦ",

      // Additional missing words
      "What": "ምን",
      "Wat": "ወጥ",
      "Br": "ብር",
      "Available": "ይገኛል",
      "Combo": "ኮምቦ",
      "Vegetarian": "ቬጀቴሪያን",
      "Kitfo": "ክትፎ",
      "Sambusa": "ሳምቡሳ",
      "Tibs": "ትብስ",
      "Tej": "ጠጅ",
      "Fresh": "ትኩስ",
      "Juice": "ጁስ",
      "Honey": "ማር",
      "Cake": "ኬክ"
    };

    // Check for exact matches first
    if (translations[text]) {
      return translations[text];
    }

    // Check for partial matches and replace (phrase by phrase, then word by word)
    let result = text;

    // Sort by length (longest first) to avoid partial replacements
    const sortedTranslations = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);

    for (const [english, amharic] of sortedTranslations) {
      if (amharic) { // Only replace if translation exists
        // Handle phrases with hyphens and special characters
        const escapedEnglish = english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Try exact phrase match first
        const exactRegex = new RegExp(`\\b${escapedEnglish}\\b`, 'gi');
        result = result.replace(exactRegex, amharic);

        // Also try without word boundaries for hyphenated words
        if (english.includes('-')) {
          const hyphenRegex = new RegExp(escapedEnglish, 'gi');
          result = result.replace(hyphenRegex, amharic);
        }
      }
    }

    // Clean up extra spaces and normalize
    result = result.replace(/\s+/g, ' ').trim();

    // Remove any remaining English articles that might be left
    result = result.replace(/\b(a|an|the)\b/gi, '').replace(/\s+/g, ' ').trim();

    return result;
  }

  // Batch translate multiple texts
  async translateBatch(texts, targetLang = 'am') {
    if (targetLang === 'en') return texts;
    
    const promises = texts.map(text => this.translateText(text, targetLang));
    return await Promise.all(promises);
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache.clear();
  }
}

// Create a singleton instance
const translationService = new TranslationService();

export default translationService;
