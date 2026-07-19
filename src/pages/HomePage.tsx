import { ApproachSection } from '../sections/home/ApproachSection';
import { CasesPlaceholderSection } from '../sections/home/CasesPlaceholderSection';
import { ContactSection } from '../sections/home/ContactSection';
import { HeroSection } from '../sections/home/HeroSection';
import { IntroSection } from '../sections/home/IntroSection';
import { ServicesPreviewSection } from '../sections/home/ServicesPreviewSection';
import { TelegramSection } from '../sections/home/TelegramSection';

interface HomePageProps {
  route: string;
}

export function HomePage({ route }: HomePageProps) {
  return (
    <>
      <HeroSection route={route} />
      <IntroSection />
      <ServicesPreviewSection route={route} />
      <ApproachSection />
      <CasesPlaceholderSection />
      <TelegramSection />
      <ContactSection />
    </>
  );
}
