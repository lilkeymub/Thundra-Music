import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Users, Gift, ArrowRightLeft, Scale, Medal, 
  GraduationCap, UserCheck, Rocket, ArrowLeft
} from 'lucide-react';

const Community = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    { 
      icon: Gift, 
      title: 'Earn $THDR Tokens', 
      description: 'Accumulate $THDR tokens per interaction, with bonuses for inviting friends. Tokens reward your devotion, convertible for real value, and grow with your tier progression—loyalty pays off!' 
    },
    { 
      icon: ArrowRightLeft, 
      title: 'Resell with Web 2 Payments', 
      description: 'Resell artist tickets using PayPal, Visa, MasterCard, American Express, UnionPay, or Mobile Money via Flutterwave. Receive a QR code for payments, ticket printing, or sharing outside the ecosystem.' 
    },
    { 
      icon: Scale, 
      title: 'Become a Web 3 Moderator', 
      description: 'Join our decentralized moderation team to uphold free speech. Flag content for review—isolated during checks—requiring 10 moderator approvals to act. Earn rewards and guide the community.' 
    },
    { 
      icon: Medal, 
      title: 'Moderator Perks', 
      description: 'Enjoy rewards, direct Thundra Team interaction, artist guidance, and giveaways (with Admin approval). Training is provided, and selection hinges on devotion, engagement, loyalty, personality, and community love!' 
    },
    { 
      icon: GraduationCap, 
      title: 'Thundra Learning Hub', 
      description: 'Master the ecosystem with our all-in-one training space. Learn to maximize rewards, engage effectively, and grow your presence, tailored for both users and aspiring moderators.' 
    },
    { 
      icon: UserCheck, 
      title: 'Join the Thundra Team', 
      description: 'Top moderators may be invited (not requested) to join as Staff, embarking on a journey in the Blockchain & AI Revolution with enhanced roles and benefits.' 
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
                <Users className="w-12 h-12 text-primary" />
              </motion.div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-primary">
                {t.nav.community}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Join, Engage, and Thrive with Thundra Music!
            </motion.p>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Your Rewards and Opportunities
            </h2>
            <p className="text-lg text-muted-foreground">
              Thundra Music rewards your every move! The more you engage, the more you earn $THDR tokens—inviting friends (doubles with each friend's join), sharing your referral link, listening 
              to music, liking or downloading tracks, joining Chat & Group Spaces, buying subscriptions or Thundra Ads, 
              participating in Thundra Market, or reselling artist tickets. Earn $THDR tokens based on your contribution 
              level, pace, and loyalty, with earnings scaling as you rise through tiers.
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

      {/* Engagement CTA */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-lg text-muted-foreground mb-8">
              Your engagement shapes our ecosystem! As you level up, your $THDR token earnings grow, with token rewards 
              at the discretion of moderators and the Thundra Team. Embrace a fair, inclusive community where your 
              voice matters.
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

export default Community;
