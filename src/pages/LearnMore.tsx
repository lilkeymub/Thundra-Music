import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Pickaxe, Smartphone, Monitor, Rocket, FileText, Briefcase, 
  Palette, Users, Apple, PlayCircle, Download, Zap, Shield, Coins,
  MessageCircle, Star, Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from 'react';

const LearnMore = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showAppStoreDialog, setShowAppStoreDialog] = useState(false);

  const miningFeatures = [
    { icon: Smartphone, title: 'Mine on Mobile', description: 'Use your smartphone to mine $THDR tokens with our lightweight mobile app.' },
    { icon: Monitor, title: 'Mine on PC', description: 'Desktop mining via our online software platform for maximum efficiency.' },
    { icon: Shield, title: 'Secure & Fair', description: 'Blockchain-backed mining ensures transparent and fair token distribution.' },
    { icon: Coins, title: 'Early Rewards', description: 'Early miners receive bonus tokens - be part of the foundation!' },
  ];

  return (
    <div className="min-h-screen noise">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-50" />
        
        {/* Animated Phone Background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="w-80 h-[600px] rounded-[3rem] border-4 border-primary/30 bg-gradient-to-b from-primary/10 to-transparent"
          >
            <div className="w-20 h-1 bg-primary/30 mx-auto mt-4 rounded-full" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent mb-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Pickaxe className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-sm font-medium text-primary">Mining Revolution</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              Start Mining{' '}
              <span className="text-gradient glow-text">$THDR</span>{' '}
              Today
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
            >
              Be part of the revolution before the official release of THUNDRA MUSIC App. 
              Mine $THDR tokens on your phone or PC and build your balance before launch. 
              <strong className="text-primary"> Hurry up before it's too late!</strong>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 glow animate-pulse-glow"
                onClick={() => setShowAppStoreDialog(true)}
              >
                <Pickaxe className="w-5 h-5 mr-2" />
                Start Mining $THDR Today
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/whitepaper')}
              >
                <FileText className="w-5 h-5 mr-2" />
                Read Whitepaper
              </Button>
            </motion.div>

            {/* App Store Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowAppStoreDialog(true)}
              >
                <Apple className="w-5 h-5" />
                App Store
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowAppStoreDialog(true)}
              >
                <PlayCircle className="w-5 h-5" />
                Play Store
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowAppStoreDialog(true)}
              >
                <Download className="w-5 h-5" />
                Desktop App
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mining Features */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Mining Technology</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our innovative mining system allows fans and artists to mine Thundra Tokens freely on their devices, 
              helping build and grow our community from the ground up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {miningFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center hover:shadow-glow transition-shadow"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                >
                  <feature.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Buttons Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Explore More</h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/business')} className="gap-2">
              <Briefcase className="w-5 h-5" />
              {t.nav.business}
            </Button>
            <Button size="lg" onClick={() => navigate('/artists')} variant="outline" className="gap-2">
              <Palette className="w-5 h-5" />
              {t.nav.artists}
            </Button>
            <Button size="lg" onClick={() => navigate('/community')} variant="outline" className="gap-2">
              <Users className="w-5 h-5" />
              {t.nav.community}
            </Button>
          </div>
        </div>
      </section>

      <SharedFooter />

      {/* App Store Coming Soon Dialog */}
      <Dialog open={showAppStoreDialog} onOpenChange={setShowAppStoreDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Rocket className="w-6 h-6 text-primary" />
              </motion.div>
              Coming Soon!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Smartphone className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
            <h3 className="font-display text-xl font-semibold mb-2">Mining Apps Coming Soon!</h3>
            <p className="text-muted-foreground mb-4">
              You will be able to mine $THDR tokens soon on your phone via our mobile app 
              and on PC via our online desktop software platform.
            </p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Stay tuned for the launch!</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LearnMore;
