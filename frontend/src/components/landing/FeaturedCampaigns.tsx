import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CampaignCard from "@/components/CampaignCard";
import { mockCampaigns } from "@/data/mockData";
import { ArrowRight } from "lucide-react";
import { sectionVariants, staggerContainer } from "./shared";

export default function FeaturedCampaigns() {
  const featured = mockCampaigns.filter((c) => c.status === "active" || c.status === "funded").slice(0, 6);

  return (
    <motion.section
      className="py-14 bg-secondary/30"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="container">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Featured</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Active Campaigns</h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 text-sm text-primary md:inline-flex">
            <Link to="/campaigns">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <motion.div
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {featured.map((campaign, index) => (
            <div key={campaign.id} className={index >= 3 ? "hidden sm:block" : ""}>
              <CampaignCard campaign={campaign} />
            </div>
          ))}
        </motion.div>
        <div className="mt-4 text-center md:hidden">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-sm text-primary">
            <Link to="/campaigns">View All Campaigns <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
