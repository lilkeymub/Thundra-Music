import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { FileText, CheckCircle, AlertTriangle, Scale, Shield, Users } from 'lucide-react';
import { termsOfService } from '@/data/legalContent';

const Terms = () => {
  return (
    <div className="min-h-screen noise">
      <Header />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"
              >
                <Scale className="w-7 h-7 text-primary" />
              </motion.div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">{termsOfService.title}</h1>
                <p className="text-muted-foreground">Last updated: {termsOfService.lastUpdated}</p>
              </div>
            </div>

            <div className="glass-card p-6 md:p-8 rounded-xl">
              <div className="prose prose-invert max-w-none">
                {termsOfService.content.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={i} className="font-display text-2xl font-bold mt-8 mb-4 text-foreground">{paragraph.replace('## ', '')}</h2>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={i} className="font-display text-xl font-semibold mt-6 mb-3 flex items-center gap-2 text-foreground">
                      {paragraph.includes('Introduction') && <FileText className="w-5 h-5 text-primary" />}
                      {paragraph.includes('Business') && <CheckCircle className="w-5 h-5 text-primary" />}
                      {paragraph.includes('User Responsibilities') && <AlertTriangle className="w-5 h-5 text-primary" />}
                      {paragraph.includes('Protection') && <Shield className="w-5 h-5 text-primary" />}
                      {paragraph.includes('Intellectual') && <Users className="w-5 h-5 text-primary" />}
                      {paragraph.replace('### ', '').replace(/\d+\.\s*/, '')}
                    </h3>;
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={i} className="list-disc list-inside text-muted-foreground space-y-2 my-4">
                        {paragraph.split('\n').filter(line => line.startsWith('- ')).map((item, j) => (
                          <li key={j}>{item.replace('- ', '').replace(/\*\*/g, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (paragraph.startsWith('**')) {
                    return <p key={i} className="font-semibold text-foreground mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</p>;
                  }
                  return <p key={i} className="text-muted-foreground leading-relaxed mb-4">{paragraph}</p>;
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="font-display text-xl font-semibold mb-4">Contact</h3>
                <p className="text-muted-foreground">
                  For questions about these terms, contact us at{' '}
                  <a href="mailto:thundramusic@gmail.com" className="text-primary hover:underline">
                    thundramusic@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
};

export default Terms;