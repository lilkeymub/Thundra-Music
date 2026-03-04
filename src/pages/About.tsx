import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();

  const team = [
    {
      name: 'Lilian Mubandilwa',
      role: 'CEO & Head of Technology',
      description: 'With a technological background in Software Engineering and Web Development, plus an enthusiasm in Blockchain, cryptos and AI technologies, Lilian is well positioned to bring a revolution in the Blockchain & AI Industry through Music by democratizing and give access to it to millions around the world through a hybrid system solution. He also worked on framework to make possible large easy-onboarding of Web 2 people to Web 3 world.'
    },
    {
      name: 'Jedidia Efongo',
      role: 'Head of Marketing & Communication',
      description: 'Got a strong expertise in social media impact and promotion. Being in that space for more than 3 years, he built many communities through platforms like Facebook and Instagram and helped them in daily interactions and engagements and onboard masses to his groups and forums. Now, he envisions to work with Thundra Music to bring that same level of engagements and onboarding spirit into the new decentralized revolution of Music.'
    },
    {
      name: 'Isaac Kanembwe',
      role: 'Head of Products',
      description: 'He has been so eager to be into something great like this. Geek on AI models and technologies related, he has an outstanding and deep knowledge in training models and categorizing them even if he is not a good coder yet. He developed tremendous products using AI and he is now excited to bring the same impact into Thundra Music ecosystem to leverage and democratize music for all.'
    },
    {
      name: 'Loïc Mubandilwa',
      role: 'Head of Edition',
      description: 'Passioned about writings, editing and contents\' creation since childhood. He has been writing strategic writings and scripts used now in Cinematographic and Technology area to empower contents and different scenarios played. He is keen to bring the same spirit and impact for Thundra Music also as well in all levels.'
    }
  ];

  return (
    <div className="min-h-screen noise">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-dots opacity-50" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold text-primary mb-4"
          >
            About Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            Meet the team behind Thundra Music, dedicated to democratizing the music industry.
          </motion.p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:shadow-glow transition-shadow"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-3xl font-display font-bold text-primary">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </motion.div>
                <h3 className="font-display text-xl font-semibold text-center mb-1">{member.name}</h3>
                <p className="text-primary text-sm text-center mb-4">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              Thundra Music stands at the forefront of a musical revolution, poised to democratize the industry. 
              Our platform empowers indie artists with 65% royalties, engages fans with token rewards, and builds 
              a global community through innovative mining technology. We believe in a future where artists retain 
              full control of their work and fans are active participants in the music ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default About;