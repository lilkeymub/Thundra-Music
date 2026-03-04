import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Zap, Users, Flame, Music, MessageCircle, ShoppingBag, Sparkles, Vote, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useBurnRecords } from '@/hooks/useBurnRecords';
import thundraLogo from '@/assets/thundra-logo.jpg';

const MusicBars = () => (
  <div className="flex items-end gap-1 h-8">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="w-1 bg-primary rounded-full music-bar" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

export const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { activeCount } = useActiveUsers();
  const { totalBurned } = useBurnRecords();

  const handleStartListening = () => {
    navigate('/dashboard');
  };

  const handleLearnMore = () => {
    navigate('/learn-more');
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 sm:pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-gradient-glow opacity-50" />
      
      {/* Animated circles */}
      <div className="absolute top-1/4 right-1/4 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 rounded-full border border-primary/20 pulse-ring hidden sm:block" />
      <div className="absolute bottom-1/4 left-1/4 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 rounded-full border border-primary/10 pulse-ring hidden sm:block" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent mb-6 sm:mb-8">
              <MusicBars />
              <span className="text-xs sm:text-sm font-medium text-primary">MusicFi Revolution</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6"
          >
            {t.hero.title}{' '}
            <span className="text-gradient glow-text">{t.hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 glow animate-pulse-glow"
              onClick={handleStartListening}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t.hero.cta}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              onClick={handleLearnMore}
            >
              {t.hero.secondaryCta}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-2"
          >
            {[
              { icon: Zap, value: '65%', label: t.hero.stats.artists },
              { icon: Users, value: '5x', label: t.hero.stats.royalties },
              { icon: Users, value: activeCount.toLocaleString(), label: t.hero.stats.fans, isLive: true },
              { icon: Flame, value: `${totalBurned.toLocaleString()} THDR`, label: t.hero.stats.burned, isLive: true },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-3 sm:p-4 md:p-6 relative">
                {stat.isLive && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
                <div className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Music, ...t.features.streaming },
    { icon: MessageCircle, ...t.features.social },
    { icon: ShoppingBag, ...t.features.marketplace },
    { icon: Sparkles, ...t.features.ai },
    { icon: Vote, ...t.features.governance },
    { icon: Wallet, ...t.features.wallet },
  ];

  return (
    <section id="discover" className="py-16 sm:py-20 md:py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{t.features.title}</h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">{t.features.subtitle}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 sm:p-5 md:p-6 hover:shadow-glow transition-shadow group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const TokenomicsSection = () => {
  const { t } = useLanguage();

  const distribution = [
    { label: t.tokenomics.artistRoyalties, value: 65, color: 'bg-primary' },
    { label: t.tokenomics.fanRewards, value: 25, color: 'bg-primary/70' },
    { label: t.tokenomics.platform, value: 10, color: 'bg-primary/40' },
  ];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{t.tokenomics.title}</h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{t.tokenomics.subtitle}</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <img src={thundraLogo} alt="$THDR" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl glow" />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {distribution.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5 sm:mb-2">
                    <span className="font-medium text-sm sm:text-base">{item.label}</span>
                    <span className="font-display font-bold text-primary text-sm sm:text-base">{item.value}%</span>
                  </div>
                  <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border text-center">
              <div className="inline-flex items-center gap-2 text-primary font-display font-bold text-sm sm:text-base">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
                {t.tokenomics.burning}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-12 sm:py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex items-center gap-3 text-center md:text-left">
            <img src={thundraLogo} alt="Thundra Music" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
            <div>
              <span className="font-display font-bold text-base sm:text-lg">THUNDRA MUSIC</span>
              <p className="text-xs sm:text-sm text-muted-foreground">{t.footer.tagline}</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
