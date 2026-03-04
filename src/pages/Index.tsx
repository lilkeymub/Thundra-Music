import { Header } from '@/components/Header';
import { HeroSection, FeaturesSection, TokenomicsSection } from '@/components/LandingSections';
import { SharedFooter } from '@/components/SharedFooter';
import CookieBanner from '@/components/dashboard/CookieBanner';

const Index = () => {
  return (
    <div className="min-h-screen noise">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TokenomicsSection />
      </main>
      <SharedFooter />
      <CookieBanner />
    </div>
  );
};

export default Index;
