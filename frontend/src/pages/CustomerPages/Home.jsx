import LandingHero from "../../components/landing/LandingHero";
import LandingFeatures from "../../components/landing/LandingFeatures";
import LandingRoles from "../../components/landing/LandingDevice";
import LandingCTA from "../../components/landing/LandingCTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent font-outfit">
      <main>
        <LandingHero />
        <LandingFeatures />
        <LandingRoles />
        <LandingCTA />
      </main>
    </div>
  );
}
