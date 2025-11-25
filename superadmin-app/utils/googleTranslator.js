// Advanced Translation Service with Google Translate and multiple fallbacks
// Optimized for production use with rate limiting and error handling

class GoogleTranslationService {
  constructor() {
    this.cache = new Map();
    this.isTranslating = new Set();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.maxConcurrentRequests = 3;
    this.requestDelay = 300; // ms between requests
    this.maxRetries = 2;

    // Enhanced Amharic dictionary for better accuracy
    this.amharicDictionary = {
      // Ethiopian food terms
      'doro wat': 'ዶሮ ወጥ',
      'doro': 'ዶሮ',
      'wat': 'ወጥ',
      'kitfo': 'ክትፎ',
      'tibs': 'ትብስ',
      'sambusa': 'ሳምቡሳ',
      'injera': 'እንጀራ',
      'berbere': 'በርበሬ',
      'mitmita': 'ሚጥሚጣ',
      'tej': 'ጠጅ',

      // Cooking methods
      'stew': 'ወጥ',
      'sautéed': 'የተበሰለ',
      'seasoned': 'በቅመም የተቀመመ',
      'served': 'የሚቀርብ',
      'filled': 'የተሞላ',
      'hard-boiled': 'በደንብ የተቀቀለ',
      'tartare': 'ጥሬ ሥጋ',
      'pastry': 'ዳቦ',
      'assorted': 'የተለያዩ',
      'traditional': 'ባህላዊ',
      'ceremony': 'ሥነ ሥርዓት',
      'freshly': 'በቅርቡ',
      'roasted': 'የተጠበሰ',
      'seasonal': 'ወቅታዊ',
      'fresh': 'ትኩስ',

      // Food items
      'chicken': 'ዶሮ',
      'beef': 'የበሬ ሥጋ',
      'lamb': 'የበግ ሥጋ',
      'eggs': 'እንቁላሎች',
      'lentils': 'ምስር',
      'meat': 'ሥጋ',
      'onions': 'ሽንኩርት',
      'peppers': 'በርበሬ',
      'bread': 'ዳቦ',
      'honey': 'ማር',
      'wine': 'ወይን',
      'coffee': 'ቡና',
      'beans': 'ፋሶሊያ',
      'juice': 'ጭማቂ',
      'cake': 'ኬክ',
      'spice': 'ቅመም',

      // Common phrases
      'with': 'ከ',
      'and': 'እና',
      'or': 'ወይም',
      'made': 'የተሰራ',
      'dishes': 'ምግቦች',
      'available': 'ይገኛል',
      'vegetarian': 'የቬጀቴሪያን',
      'combo': 'ኮምቦ',
      'ethiopian': 'ኢትዮጵያዊ'
    };
  }

  async translateText(text, targetLang = 'am') {
    if (!text || targetLang === 'en') return text;

    const cacheKey = `${text}_${targetLang}`;

    // Return cached translation
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Pre-process with dictionary for better accuracy
    if (targetLang === 'am') {
      const dictionaryResult = this.translateWithDictionary(text);
      if (dictionaryResult !== text) {
        this.cache.set(cacheKey, dictionaryResult);
        return dictionaryResult;
      }
    }

    // Avoid duplicate requests
    if (this.isTranslating.has(cacheKey)) {
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
      // Try multiple translation services in order
      let translatedText = await this.tryGoogleTranslate(text, targetLang);
      
      if (!translatedText || translatedText === text) {
        translatedText = await this.tryMyMemoryTranslate(text, targetLang);
      }
      
      if (!translatedText || translatedText === text) {
        translatedText = await this.tryLibreTranslate(text, targetLang);
      }
      
      // Final fallback - return original if all fail
      if (!translatedText) {
        translatedText = text;
      }
      
      this.cache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.warn('All translation methods failed:', error);
      this.cache.set(cacheKey, text);
      return text;
    } finally {
      this.isTranslating.delete(cacheKey);
    }
  }

  translateWithDictionary(text) {
    if (!text) return text;

    const lowerText = text.toLowerCase();

    // Check for exact matches first
    if (this.amharicDictionary[lowerText]) {
      return this.amharicDictionary[lowerText];
    }

    // Check for partial matches and replace
    let translatedText = text;
    for (const [english, amharic] of Object.entries(this.amharicDictionary)) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, amharic);
    }

    return translatedText;
  }

  async tryGoogleTranslate(text, targetLang, retryCount = 0) {
    try {
      // Using backend proxy for Google Translate to avoid CORS
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          targetLang: targetLang
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data && data.success && data.translatedText) {
        let translatedText = data.translatedText;

        // Post-process to ensure pure Amharic - remove any remaining English words
        if (targetLang === 'am') {
          translatedText = this.ensurePureAmharic(translatedText);
        }

        return translatedText;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.tryGoogleTranslate(text, targetLang, retryCount + 1);
      }
      console.warn('Google Translate failed:', error.message);
      return null;
    }
  }

  ensurePureAmharic(text) {
    if (!text) return text;

    // Replace any remaining English words with Amharic equivalents
    let result = text;

    // Common English words that might slip through
    const englishToAmharic = {
      'with': 'ከ',
      'and': 'እና',
      'or': 'ወይም',
      'the': '',
      'a': '',
      'an': '',
      'of': 'የ',
      'in': 'በ',
      'on': 'ላይ',
      'at': 'በ',
      'to': 'ወደ',
      'for': 'ለ',
      'from': 'ከ',
      'by': 'በ',
      'is': 'ነው',
      'are': 'ናቸው',
      'was': 'ነበር',
      'were': 'ነበሩ',
      'be': 'መሆን',
      'been': 'ነበር',
      'have': 'አለ',
      'has': 'አለው',
      'had': 'ነበረው',
      'do': 'ማድረግ',
      'does': 'ያደርጋል',
      'did': 'አደረገ',
      'will': 'ይሆናል',
      'would': 'ይሆን ነበር',
      'could': 'ይችል ነበር',
      'should': 'መሆን አለበት'
    };

    // Replace English words with Amharic
    for (const [english, amharic] of Object.entries(englishToAmharic)) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      result = result.replace(regex, amharic);
    }

    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  async tryMyMemoryTranslate(text, targetLang, retryCount = 0) {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`,
        {
          signal: AbortSignal.timeout(5000)
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
      
      throw new Error('Invalid response');
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.tryMyMemoryTranslate(text, targetLang, retryCount + 1);
      }
      console.warn('MyMemory translation failed:', error.message);
      return null;
    }
  }

  async tryLibreTranslate(text, targetLang, retryCount = 0) {
    try {
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data && data.translatedText) {
        return data.translatedText;
      }
      
      throw new Error('Invalid response');
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.tryLibreTranslate(text, targetLang, retryCount + 1);
      }
      console.warn('LibreTranslate failed:', error.message);
      return null;
    }
  }

  // Batch translation for better performance
  async translateBatch(texts, targetLang = 'am') {
    const results = await Promise.allSettled(
      texts.map(text => this.translateText(text, targetLang))
    );
    
    return results.map((result, index) => 
      result.status === 'fulfilled' ? result.value : texts[index]
    );
  }

  // Clear cache to free memory
  clearCache() {
    this.cache.clear();
  }

  // Get cache size for monitoring
  getCacheSize() {
    return this.cache.size;
  }
}

const googleTranslationService = new GoogleTranslationService();
export default googleTranslationService;
