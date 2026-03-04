// Translation helper hook
import { useLanguage } from '@/contexts/LanguageContext';
import { completeTranslations } from '@/data/translations';
import type { 
  DashboardTranslations, 
  SettingsTranslations, 
  AuthTranslations, 
  WalletTranslations, 
  CommonTranslations, 
  ExplorerTranslations, 
  MarketplaceTranslations, 
  ArtistTranslations, 
  ModeratorTranslations, 
  AdminTranslations, 
  FeedTranslations, 
  LeaderboardTranslations, 
  LearningTranslations, 
  NotificationTranslations, 
  SubscriptionTranslations, 
  PageTranslations 
} from '@/data/translations';
import type { LanguageCode } from '@/contexts/LanguageContext';

// Get translation with fallback to English
function getTranslationWithFallback<T>(
  lang: LanguageCode, 
  section: keyof typeof completeTranslations['en'],
  fallbackLang: LanguageCode = 'en'
): T {
  const langTranslations = completeTranslations[lang]?.[section];
  const fallback = completeTranslations[fallbackLang][section] as T;
  
  // Check if the translation object is empty or incomplete
  if (!langTranslations || Object.keys(langTranslations).length === 0) {
    return fallback;
  }
  
  // Merge with fallback to ensure all keys exist
  return { ...fallback, ...langTranslations } as T;
}

export function useTranslations() {
  const { language } = useLanguage();
  
  const dashboard = getTranslationWithFallback<DashboardTranslations>(language, 'dashboard');
  const settings = getTranslationWithFallback<SettingsTranslations>(language, 'settings');
  const auth = getTranslationWithFallback<AuthTranslations>(language, 'auth');
  const wallet = getTranslationWithFallback<WalletTranslations>(language, 'wallet');
  const common = getTranslationWithFallback<CommonTranslations>(language, 'common');
  const explorer = getTranslationWithFallback<ExplorerTranslations>(language, 'explorer');
  const marketplace = getTranslationWithFallback<MarketplaceTranslations>(language, 'marketplace');
  const artist = getTranslationWithFallback<ArtistTranslations>(language, 'artist');
  const moderator = getTranslationWithFallback<ModeratorTranslations>(language, 'moderator');
  const admin = getTranslationWithFallback<AdminTranslations>(language, 'admin');
  const feed = getTranslationWithFallback<FeedTranslations>(language, 'feed');
  const leaderboard = getTranslationWithFallback<LeaderboardTranslations>(language, 'leaderboard');
  const learning = getTranslationWithFallback<LearningTranslations>(language, 'learning');
  const notification = getTranslationWithFallback<NotificationTranslations>(language, 'notification');
  const subscription = getTranslationWithFallback<SubscriptionTranslations>(language, 'subscription');
  const pages = getTranslationWithFallback<PageTranslations>(language, 'pages');

  return {
    dashboard,
    settings,
    auth,
    wallet,
    common,
    explorer,
    marketplace,
    artist,
    moderator,
    admin,
    feed,
    leaderboard,
    learning,
    notification,
    subscription,
    pages,
    currentLanguage: language
  };
}

// For simple string translations with interpolation
export function interpolate(text: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, text);
}
