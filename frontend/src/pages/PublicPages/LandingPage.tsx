import LandingHero from '../../components/landing/LandingHero';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingRoles from '../../components/landing/LandingDevice';
import LandingCTA from '../../components/landing/LandingCTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-outfit text-gray-900 dark:bg-gray-900 dark:text-white">
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingRoles />
        <LandingCTA />
      </main>
    </div>
  );
}
