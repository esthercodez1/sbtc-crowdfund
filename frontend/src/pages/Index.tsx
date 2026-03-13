import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PageTransition from "@/components/PageTransition";
import HeroSection from "@/components/landing/HeroSection";
import SectionSeparator from "@/components/landing/SectionSeparator";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedCampaigns from "@/components/landing/FeaturedCampaigns";
import TrustIndicators from "@/components/landing/TrustIndicators";
import CTABanner from "@/components/landing/CTABanner";

export default function Index() {
  return (
    <PageTransition>
      <Layout>
        <SEOHead
          title="sBTCFund — Decentralized Crowdfunding on Bitcoin"
          description="Decentralized crowdfunding powered by Stacks. Create campaigns with milestone-based fund releases, contribute STX, and build the Bitcoin ecosystem."
        />
        <HeroSection />
        <SectionSeparator />
        <HowItWorks />
        <SectionSeparator />
        <FeaturedCampaigns />
        <SectionSeparator />
        <TrustIndicators />
        <CTABanner />
        <Footer />
      </Layout>
    </PageTransition>
  );
}
