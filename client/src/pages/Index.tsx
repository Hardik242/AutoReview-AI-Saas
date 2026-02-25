import {Navbar} from "@/components/landing/Navbar";
import {HeroSection} from "@/components/landing/HeroSection";
import {HowItWorksSection} from "@/components/landing/HowItWorksSection";
import {FeaturesSection} from "@/components/landing/FeaturesSection";
import {PricingSection} from "@/components/landing/PricingSection";
import {Footer} from "@/components/landing/Footer";
import {useQuery} from "@tanstack/react-query";
import {api} from "@/lib/api";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

const Index = () => {
	// const navigate = useNavigate();

	// const {data: user, isLoading} = useQuery({
	// 	queryKey: ["user"],
	// 	queryFn: api.user.profile,
	// 	retry: false,
	// });

	// useEffect(() => {
	// 	if (user) {
	// 		navigate("/dashboard", {replace: true});
	// 	}
	// }, [user, navigate]);

	// if (isLoading) {
	// 	return (
	// 		<div className="min-h-screen bg-background flex items-center justify-center">
	// 			<div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
	// 		</div>
	// 	);
	// }

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
};

export default Index;
