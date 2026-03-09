import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage, languages } from '@/contexts/LanguageContext';

// Language detection based on common character patterns
function detectLanguage(text: string): string {
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  // Chinese
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  // Japanese
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
  // Korean
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
  // Cyrillic (Russian, etc.)
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  // Greek
  if (/[\u0370-\u03FF]/.test(text)) return 'el';
  // Hebrew
  if (/[\u0590-\u05FF]/.test(text)) return 'he';
  // Thai
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
  // French accents
  if (/[àâäéèêëïîôùûüÿœæç]/i.test(text)) return 'fr';
  // German
  if (/[äöüß]/i.test(text)) return 'de';
  // Spanish
  if (/[áéíóúñ¿¡]/i.test(text)) return 'es';
  // Portuguese
  if (/[ãõâêôç]/i.test(text)) return 'pt';
  // Default to English
  return 'en';
}

export function useLiveTranslation() {
  const { language: appLanguage } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const translateText = useCallback(async (text: string, id: string): Promise<string> => {
    if (!text || text.trim().length === 0) return text;
    
    // Heuristic detection is only for UI hints; the backend does authoritative detection + translation.
    const detectedLang = detectLanguage(text);

    // Check cache
    const cacheKey = `${id}_${appLanguage}`;
    if (translations[cacheKey]) {
      return translations[cacheKey];
    }

    // Mark as loading
    setLoading(prev => ({ ...prev, [cacheKey]: true }));

    try {
      const targetLangName = getLanguageName(appLanguage);

      const { data, error } = await supabase.functions.invoke('thundra-ai', {
        body: {
          task: 'translate',
          text,
          targetLang: appLanguage,
          targetLangName,
          tier: 'free',
          stream: false,
        }
      });

      if (error) throw error;
      
      const translated = data?.response?.trim() || text;
      
      // Verify translation is different from original (unless same language)
      if (translated === text && detectedLang !== appLanguage) {
        console.warn('Translation may have failed - returned original text');
      }
      
      // Cache the translation
      setTranslations(prev => ({ ...prev, [cacheKey]: translated }));
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
      
      return translated;
    } catch (err) {
      console.error('Translation error:', err);
      setLoading(prev => ({ ...prev, [cacheKey]: false }));
      return text;
    }
  }, [appLanguage, translations]);

  const needsTranslation = useCallback((text: string): boolean => {
    if (!text) return false;
    const detectedLang = detectLanguage(text);
    return detectedLang !== appLanguage;
  }, [appLanguage]);

  const getDetectedLanguage = useCallback((text: string): string => {
    return getLanguageName(detectLanguage(text));
  }, []);

  return {
    translateText,
    needsTranslation,
    getDetectedLanguage,
    translations,
    loading,
    appLanguage
  };
}

function getLanguageName(code: string): string {
  const appLang = languages.find((l) => l.code === (code as any));
  if (appLang?.name) return appLang.name;

  // Extra codes that can appear via detection but are not necessarily app UI languages.
  const extra: Record<string, string> = {
    el: 'Greek',
    he: 'Hebrew',
    th: 'Thai',
    id: 'Indonesian',
    ms: 'Malay',
    pl: 'Polish',
    ta: 'Tamil',
    te: 'Telugu',
    mr: 'Marathi',
    gu: 'Gujarati',
    kn: 'Kannada',
    ml: 'Malayalam',
    pa: 'Punjabi',
    ur: 'Urdu',
    bn: 'Bengali',
  };

  return extra[code] || 'English';
}
