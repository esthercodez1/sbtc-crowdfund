import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Search } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { mockCampaigns } from "@/data/mockData";
import CampaignCard from "@/components/CampaignCard";

const suggestedCampaigns = mockCampaigns.filter((c) => c.status === "active").slice(0, 3);

const NotFound = () => {
  return (
    <PageTransition>
      <Layout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          {/* Floating Bitcoin animation */}
          <motion.div
            className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-primary/10"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="font-display text-6xl font-bold text-primary">₿</span>
          </motion.div>

          <motion.h1
            className="font-display text-4xl font-bold text-foreground md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            404 — Page Not Found
          </motion.h1>

          <motion.p
            className="mt-4 max-w-md text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            The page you're looking for doesn't exist or has been moved. Looking for a campaign? Try browsing all campaigns.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button asChild className="gap-2 gradient-orange border-0 text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-transform">
              <Link to="/"><Home className="h-4 w-4" /> Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 border-border">
              <Link to="/campaigns"><Search className="h-4 w-4" /> Explore Campaigns</Link>
            </Button>
          </motion.div>
        </div>

        {/* Suggested campaigns */}
        {suggestedCampaigns.length > 0 && (
          <section className="container pb-20">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold">You might be looking for</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {suggestedCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild variant="ghost" className="gap-2 text-primary">
                <Link to="/campaigns">View All Campaigns <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </section>
        )}
      </Layout>
    </PageTransition>
  );
};

export default NotFound;
