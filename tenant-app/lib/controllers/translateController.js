// Translation proxy to avoid CORS issues

// Translation proxy to avoid CORS issues
export const translateText = async (req, res) => {
  try {
    const { text, targetLang = 'am' } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required' 
      });
    }

    // Try Google Translate first using native fetch
    try {
      const googleResponse = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(8000)
        }
      );

      if (googleResponse.ok) {
        const data = await googleResponse.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          return res.json({
            success: true,
            translatedText: data[0][0][0],
            service: 'google'
          });
        }
      }
    } catch (error) {
      console.log('Google Translate failed, trying fallback:', error.message);
    }

    // Fallback to MyMemory API
    try {
      const myMemoryResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (myMemoryResponse.ok) {
        const data = await myMemoryResponse.json();
        if (data && data.responseData && data.responseData.translatedText) {
          return res.json({
            success: true,
            translatedText: data.responseData.translatedText,
            service: 'mymemory'
          });
        }
      }
    } catch (error) {
      console.log('MyMemory failed, trying LibreTranslate:', error.message);
    }

    // Fallback to LibreTranslate
    try {
      const libreResponse = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: targetLang,
          format: 'text'
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (libreResponse.ok) {
        const data = await libreResponse.json();
        if (data && data.translatedText) {
          return res.json({
            success: true,
            translatedText: data.translatedText,
            service: 'libretranslate'
          });
        }
      }
    } catch (error) {
      console.log('LibreTranslate failed:', error.message);
    }

    // If all services fail, return original text
    return res.json({
      success: true,
      translatedText: text,
      service: 'fallback'
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Translation service error' 
    });
  }
};
