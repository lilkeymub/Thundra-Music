import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import thundraLogo from '@/assets/thundra-logo.jpg';

export const SharedFooter = () => {
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/thundramusic', label: '@thundramusic' },
    { icon: Twitter, href: 'https://twitter.com/ThundraMusic', label: '@ThundraMusic' },
    { icon: Instagram, href: 'https://instagram.com/thundra_music', label: '@thundra_music' },
  ];

  return (
    <footer className="py-12 sm:py-16 border-t border-border bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={thundraLogo} alt="Thundra Music" className="h-10 w-10 rounded-lg" />
              <span className="font-display font-bold text-lg">
                <span className="text-primary">THUNDRA</span> <span className="text-foreground">MUSIC</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.quickLinks}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t.footer.aboutUs}</Link></li>
              <li><Link to="/learn-more" className="hover:text-primary transition-colors">{t.footer.learnMore}</Link></li>
              <li><Link to="/whitepaper" className="hover:text-primary transition-colors">{t.footer.whitepaper}</Link></li>
              <li><Link to="/business" className="hover:text-primary transition-colors">{t.nav.business}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.legal}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">{t.footer.privacyPolicy}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">{t.footer.termsOfService}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.contact}</h3>
            <a href="mailto:thundramusic@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
              <Mail className="w-4 h-4" />
              thundramusic@gmail.com
            </a>
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};
