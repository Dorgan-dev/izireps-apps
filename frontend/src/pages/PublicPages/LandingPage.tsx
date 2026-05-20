import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingHero from '../../components/landing/LandingHero';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingWorkflow from '../../components/landing/LandingWorkflow';
import LandingRoles from '../../components/landing/LandingRoles';
import LandingCTA from '../../components/landing/LandingCTA';
import LandingFooter from '../../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingWorkflow />
      <LandingRoles />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
