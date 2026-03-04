import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import thundraLogo from '@/assets/thundra-logo.jpg';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const currentLang = languages.find(l => l.code === language);

  const navItems = [
    { label: t.nav.discover, href: '#discover' },
    { label: 'For Business', href: '/business', isRoute: true },
    { label: t.nav.artists, href: '/artists', isRoute: true },
    { label: 'For Community', href: '/community', isRoute: true },
  ];

  const handleLogin = () => {
    setIsOpen(false);
    navigate('/auth?mode=login');
  };

  const handleSignup = () => {
    setIsOpen(false);
    navigate('/auth?mode=signup');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            <img src={thundraLogo} alt="Thundra Music" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
            <span className="font-display font-bold text-lg sm:text-xl">
              <span className="text-primary">THUNDRA</span> <span className="text-foreground">MUSIC</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              item.isRoute ? (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              )
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <span>{currentLang?.flag}</span>
                <ChevronDown className="w-3 h-3 hidden sm:block" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 max-h-64 overflow-y-auto glass-card p-2 shadow-lg z-50"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-accent transition-colors ${language === lang.code ? 'bg-accent text-primary' : ''}`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center rounded-lg bg-secondary p-0.5 sm:p-1">
              {[
                { value: 'light', icon: Sun },
                { value: 'system', icon: Monitor },
                { value: 'dark', icon: Moon },
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value as any)}
                  className={`p-1.5 sm:p-2 rounded-md transition-colors ${theme === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLogin}>{t.nav.login}</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleSignup}>{t.nav.getStarted}</Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2">
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border/50"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                item.isRoute ? (
                  <button 
                    key={item.href} 
                    onClick={() => { navigate(item.href); setIsOpen(false); }}
                    className="py-2 text-left text-muted-foreground hover:text-primary"
                  >
                    {item.label}
                  </button>
                ) : (
                  <a 
                    key={item.href} 
                    href={item.href} 
                    className="py-2 text-muted-foreground hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              ))}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleLogin}>{t.nav.login}</Button>
                <Button className="flex-1" onClick={handleSignup}>{t.nav.signup}</Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
