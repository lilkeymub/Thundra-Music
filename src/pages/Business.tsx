import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, Target, BarChart3, Coins, Users, Cog, 
  CheckCircle, Rocket, ArrowLeft
} from 'lucide-react';

const Business = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const benefits = [
    { 
      icon: Target, 
      title: 'Targeted Exposure', 
      description: 'Reach millions of users with precision targeting based on interests, behaviors, and engagement patterns within our ecosystem.' 
    },
    { 
      icon: BarChart3, 
      title: 'Boost Visibility', 
      description: 'Increase your brand\'s visibility across our platform, driving traffic and potential customers to your commerce channels.' 
    },
    { 
      icon: Coins, 
      title: 'Earn Through Engagement', 
      description: 'Benefit from a revenue-sharing model where user interactions with your ads contribute to your earnings alongside our token ecosystem.' 
    },
    { 
      icon: Users, 
      title: 'Grow Your Userbase', 
      description: 'Convert engaged users into loyal customers, expanding your reach beyond our ecosystem through word-of-mouth and shared content.' 
    },
  ];

  return (
    <div className="min-h-screen noise">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-50" />
        
        {/* Animated Background Elements */}
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
                <Megaphone className="w-12 h-12 text-primary" />
              </motion.div>
              <h1 className="font-display text-4xl md:text-6xl font-bold">
                Thundra Ads - <span className="text-gradient">Revolutionize Your Business</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Unlock Outstanding Opportunities with Thundra Ads
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button size="lg" className="gap-2" disabled>
                <Rocket className="w-5 h-5" />
                Coming Soon
              </Button>
            </motion.div>
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
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Megaphone className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">Welcome to Thundra Ads</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Thundra Ads is a groundbreaking advertising system designed exclusively for businesses, startups, 
              companies, and individuals running commerce ventures. By integrating seamlessly into the Thundra Music 
              ecosystem, Thundra Ads offers an unparalleled opportunity to showcase your products to our vast and 
              engaged userbase. This platform is not just about visibility—it's about transforming your brand's reach, 
              driving user acquisition, and enabling you to earn through innovative ad solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Cog className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">How Thundra Ads Works</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Thundra Ads leverages our ecosystem's hybrid Web 2 + Web 3 technology to deliver targeted, dynamic 
              advertisements across multiple channels—display, video, and social integrations. Businesses can create 
              personalized ad campaigns that resonate with our diverse audience, utilizing real-time data to optimize 
              exposure. Our large userbase, actively engaged with music and community features, becomes your marketplace, 
              where your products gain traction through interactive and rewarding ad experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Benefits for Your Business</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:shadow-glow transition-shadow"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                >
                  <benefit.icon className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">Why Choose Thundra Ads?</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Traditional advertising often falls short for startups and small businesses due to high costs and 
              limited targeting. Thundra Ads levels the playing field by offering a cost-effective, scalable solution 
              that integrates with our blockchain-backed ecosystem. Whether you're a solo entrepreneur launching a 
              product or a company seeking to penetrate new markets, Thundra Ads provides the tools to amplify your 
              presence.
            </p>
            <Button size="lg" className="gap-2" disabled>
              <Rocket className="w-5 h-5" />
              Coming Soon
            </Button>
          </motion.div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default Business;