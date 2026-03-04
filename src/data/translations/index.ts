// Translations index - imports all language translations and re-exports them
import { deTranslations } from './de';
import { ptTranslations } from './pt';
import { arTranslations } from './ar';

// Export all translations for use in the main translations file
export const additionalTranslations = {
  de: deTranslations,
  pt: ptTranslations,
  ar: arTranslations,
};

// These can be merged into completeTranslations in the main file
export { deTranslations, ptTranslations, arTranslations };
