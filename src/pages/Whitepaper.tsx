import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  FileText, AlertTriangle, Lightbulb, Coins, Shield, Users, 
  Pickaxe, Flame, Lock, BarChart3, Vote, Calendar, Globe
} from 'lucide-react';

const Whitepaper = () => {
  const { t } = useLanguage();

  const tokenDistribution = [
    { label: 'Community Lifetime Rewards', value: 70, color: 'bg-primary' },
    { label: 'Mining Rewards Pool', value: 10, color: 'bg-primary/80' },
    { label: 'Partnerships & Ecosystem Growth', value: 10, color: 'bg-primary/60' },
    { label: 'Team & Advisors (4yr lock)', value: 5, color: 'bg-primary/40' },
    { label: 'Liquidity', value: 5, color: 'bg-primary/20' },
  ];

  const roadmap = [
    { quarter: 'Q1 2026', title: 'Beta Launch', description: 'Beta testing launch + mining apps' },
    { quarter: 'Q3 2026', title: 'Full Launch', description: 'Full platform launch with 10,000 artists and 1,000,000 users, mining stops' },
    { quarter: 'Q4 2026', title: 'Mobile Apps', description: 'Mobile app release on iOS and Android and Desktop app for Windows' },
    { quarter: 'Q1 2027', title: 'Governance', description: 'Governance rollout, enabling token holder voting' },
  ];

  return (
    <div className="min-h-screen noise">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-50" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6"
          >
            <FileText className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold mb-4"
          >
            THUNDRA MUSIC <span className="text-gradient">WHITEPAPER</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl text-primary font-display"
          >
            Let's Democratize the Music Industry!
          </motion.p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">THE PROBLEM</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              The music industry is fundamentally broken, with centralized platforms like Spotify, Apple Music, 
              and YouTube extracting disproportionate value from artists and offering minimal engagement for fans. 
              In 2023, the global music streaming market generated over $36.7B, yet artists receive only 10–20% 
              of royalties due to opaque payment systems and intermediary commissions.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-6">
                <h3 className="font-display text-xl font-semibold mb-4">Artists Face:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Low Royalties:</strong> Platforms prioritize profits, leaving artists with fractions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Lack of Ownership:</strong> Artists sign away rights to their music</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Opaque Payments:</strong> Complex, non-transparent royalty calculations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Fan Disconnect:</strong> Limited tools for direct artist-fan interaction</span>
                  </li>
                </ul>
              </div>
              <div className="glass-card p-6">
                <h3 className="font-display text-xl font-semibold mb-4">Fans Face:</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Passive Consumption:</strong> No incentives beyond streaming</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>No Ownership:</strong> Cannot own or influence the music they love</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Discovery Challenges:</strong> 60,000 new tracks uploaded daily</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Lack of Rewards:</strong> No tangible benefits for supporting artists</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">THE SOLUTION</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Thundra Music is a decentralized socio-music streaming platform that addresses industry inequities 
              by leveraging Blockchain for transparency, scalability, and privacy, and AI as a tool for production.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <Coins className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Transparent Royalties</h3>
                <p className="text-muted-foreground">Smart contracts ensure artists receive 65% of streaming revenue, paid instantly and transparently.</p>
              </div>
              <div className="glass-card p-6">
                <Shield className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Artist Ownership</h3>
                <p className="text-muted-foreground">Artists upload music and mint NFTs for exclusive content, retaining full control and monetization rights.</p>
              </div>
              <div className="glass-card p-6">
                <Users className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Fan Engagement</h3>
                <p className="text-muted-foreground">Fans earn $THDR tokens for streaming, liking, commenting, sharing, or curating playlists.</p>
              </div>
              <div className="glass-card p-6">
                <Vote className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Community Governance</h3>
                <p className="text-muted-foreground">Token holders vote on platform features, artist promotions, and reward structures.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blockchain Technology */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">BLOCKCHAIN TECHNOLOGY</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <Pickaxe className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Mining</h3>
                <p className="text-muted-foreground">Fans and artists mine Thundra tokens, create, and build engagement and a community-driven economy.</p>
              </div>
              <div className="glass-card p-6">
                <Coins className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Low Gas Fees</h3>
                <p className="text-muted-foreground">$0.0001 transaction costs enable micro-payments for streams and rewards.</p>
              </div>
              <div className="glass-card p-6">
                <Flame className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Burning Mechanism</h3>
                <p className="text-muted-foreground">100% of transaction fees are burned, reducing token supply and increasing value.</p>
              </div>
              <div className="glass-card p-6">
                <Lock className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Privacy & Data Ownership</h3>
                <p className="text-muted-foreground">Encrypted user profiles ensure full control over data and identity.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">TOKENOMICS</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              With an initial supply of 1 billion $THDR tokens, designed to ensure long-term sustainability and value creation.
            </p>

            <div className="glass-card p-8">
              <h3 className="font-display text-xl font-semibold mb-6 text-center">Token Distribution</h3>
              <div className="space-y-4">
                {tokenDistribution.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-display font-bold text-primary">{item.value}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="w-8 h-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold">ROADMAP</h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20" />
              
              {roadmap.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex items-center mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary -translate-x-1/2" />
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="glass-card p-6">
                      <span className="text-primary font-display font-bold">{item.quarter}</span>
                      <h3 className="font-display text-xl font-semibold mt-2">{item.title}</h3>
                      <p className="text-muted-foreground mt-2">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Global Impact */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">GLOBAL IMPACT</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Thundra Music aims to democratize music worldwide, targeting global markets with 1B global music fans 
              and 5M indie artists. Our platform addresses inequities in regions like Southeast Asia (200M users), 
              Africa (300M), and Latin America (150M).
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <div className="font-display text-3xl font-bold text-primary">1B+</div>
                <div className="text-muted-foreground">Global Fans</div>
              </div>
              <div className="glass-card p-6">
                <div className="font-display text-3xl font-bold text-primary">5M+</div>
                <div className="text-muted-foreground">Indie Artists</div>
              </div>
              <div className="glass-card p-6">
                <div className="font-display text-3xl font-bold text-primary">65%</div>
                <div className="text-muted-foreground">Artist Royalties</div>
              </div>
            </div>
            </motion.div>
          </div>
        </section>

        {/* Download Whitepaper Section */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center glass-card p-8 md:p-12 rounded-2xl"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Download Full Whitepaper
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get the complete Thundra Music whitepaper with all technical details, tokenomics breakdown, and roadmap milestones in PDF format.
              </p>
              <a
                href="https://drive.google.com/file/d/13C9JRCDjKFHOsy9d4mST3iaGGVd6yvxc/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2">
                  <FileText className="w-5 h-5" />
                  Download PDF Whitepaper
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

        <SharedFooter />
      </div>
    );
};

export default Whitepaper;