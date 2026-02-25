import {Navbar} from "@/components/landing/Navbar";
import {HeroSection} from "@/components/landing/HeroSection";
import {HowItWorksSection} from "@/components/landing/HowItWorksSection";
import {FeaturesSection} from "@/components/landing/FeaturesSection";
import {PricingSection} from "@/components/landing/PricingSection";
import {Footer} from "@/components/landing/Footer";

export default function Index() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="pt-16">
				<HeroSection />
				<HowItWorksSection />
				<FeaturesSection />
				<PricingSection />
			</main>
			<Footer />
		</div>
	);
}
