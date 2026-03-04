import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Paintbrush, Shield, Coins, Megaphone, Users, Ticket, 
  Rocket, ArrowLeft, Sparkles
} from 'lucide-react';

const Artists = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    { 
      icon: Paintbrush, 
      title: 'Express Yourself Freely', 
      description: 'Turn Thundra Market into your personal stage, where you can showcase your art, music, and personality. Upload videos, audio, or digital assets, and engage your community with live updates.' 
    },
    { 
      icon: Shield, 
      title: 'Decentralized Security with Blockchain', 
      description: 'Leverage cutting-edge Blockchain technology to ensure every transaction and interaction is secure, transparent, and free from middlemen. Your intellectual property and fan connections are protected with immutable records.' 
    },
    { 
      icon: Coins, 
      title: 'Flexible Monetization', 
      description: 'Sell your work using ION tokens, offer limited-edition drops, or give items away for free to build your audience. Set your prices, and allow fans to resell, with Thundra Team taking only 10% to fuel ecosystem growth.' 
    },
    { 
      icon: Megaphone, 
      title: 'Boost with Thundra Ads', 
      description: 'Promote your shows, interviews, or programs directly to your community using Thundra Ads. Reach a wider audience, enhance visibility, and drive engagement with targeted campaigns.' 
    },
    { 
      icon: Users, 
      title: 'Direct Fan Engagement', 
      description: 'Use Chat & Group Spaces to interact privately and securely with fans. Share behind-the-scenes content, host Q&A sessions, or collaborate on projects, strengthening your community.' 
    },
    { 
      icon: Ticket, 
      title: 'Empower Resellers', 
      description: 'Choose trusted users to resell your event tickets or show passes. Negotiate prices with them or allow external sales for profit maximization.' 
    },
  ];

  return (
    <div className="min-h-screen noise">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-50" />
        
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/10 text-4xl"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                opacity: 0 
              }}
              animate={{ 
                y: [null, '-100%'],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            >
              ♪
            </motion.div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/learn-more')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Paintbrush className="w-12 h-12 text-primary" />
              </motion.div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-primary">
                For Artists
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Unleash Your Creativity and Thrive with Thundra Market!
            </motion.p>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Welcome to Thundra Market - Your Exclusive Stage
            </h2>
            <p className="text-lg text-muted-foreground">
              Thundra Market is your dedicated platform, designed exclusively for artists to shine like stars on a 
              reality TV show. With full access, you can upload, sell, or share creations—collections, merchandise, 
              event tickets, promotions, invitations, and more—in unlimited or limited editions. Connect directly 
              with your fanbase through secure Chat & Group Spaces, all powered by decentralized Blockchain technology 
              for privacy and trust.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:shadow-glow transition-shadow"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                >
                  <feature.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Web3 Revolution */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">Be Your Own Boss</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Be your own boss with the Web 3 Revolution! Thundra Learning offers comprehensive training to master 
              our ecosystem, helping you become a successful, engaged artist. With only 10% of transactions supporting 
              future advancements, you keep the majority of your earnings securely.
            </p>
            <Button 
              size="lg" 
              className="gap-2"
              onClick={() => navigate('/auth?mode=signup')}
            >
              <Rocket className="w-5 h-5" />
              Get Started
            </Button>
          </motion.div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default Artists;