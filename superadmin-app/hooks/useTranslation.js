import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../i18n';
import googleTranslationService from '../utils/googleTranslator';

// Hook for translating menu items and categories with async translation
export const useTranslatedContent = (items, lang) => {
  const [translatedItems, setTranslatedItems] = useState(items);
  const [isTranslating, setIsTranslating] = useState(false);

  // Memoize items to prevent unnecessary re-translations
  const itemsKey = useMemo(() => {
    if (!items) return '';
    return items.map(item => `${item.id}-${item.name}`).join('|');
  }, [items]);

  useEffect(() => {
    if (!items || items.length === 0) {
      setTranslatedItems([]);
      return;
    }

    if (lang === 'en') {
      setTranslatedItems(items);
      return;
    }

    const translateItems = async () => {
      setIsTranslating(true);
      try {
        // Use Google Translate for all items
        const translated = await Promise.all(
          items.map(async (item) => {
            try {
              const translatedName = await googleTranslationService.translateText(item.name, lang);
              const translatedDescription = item.description
                ? await googleTranslationService.translateText(item.description, lang)
                : item.description;

              return {
                ...item,
                name: translatedName,
                description: translatedDescription
              };
            } catch (error) {
              console.warn('Translation failed for item:', item.name, error);
              // Return original if translation fails
              return item;
            }
          })
        );
        setTranslatedItems(translated);
      } catch (error) {
        console.warn('Translation failed:', error);
        setTranslatedItems(items); // fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    // Debounce translation to avoid rapid calls
    const timeoutId = setTimeout(translateItems, 100);
    return () => clearTimeout(timeoutId);
  }, [itemsKey, lang]);

  return { translatedItems, isTranslating };
};

// Hook for translating a single text item
export const useTranslatedText = (text, lang) => {
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!text || lang === 'en') {
      setTranslatedText(text);
      return;
    }

    const translateText = async () => {
      setIsTranslating(true);
      try {
        const translated = await googleTranslationService.translateText(text, lang);
        setTranslatedText(translated);
      } catch (error) {
        console.warn('Translation failed:', error);
        setTranslatedText(text); // fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, lang]);

  return { translatedText, isTranslating };
};
