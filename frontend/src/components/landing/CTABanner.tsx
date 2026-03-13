import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { sectionVariants } from "./shared";

export default function CTABanner() {
  return (
    <motion.section
      className="gradient-hero relative overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] rounded-full bg-primary/[0.06] blur-[80px] pointer-events-none" />
      <div className="container relative z-10 py-16 text-center">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Ready to build on <span className="text-gradient-orange">Bitcoin</span>?
        </h2>
        <p className="mt-3 text-sm text-white/50 max-w-md mx-auto">
          Launch your decentralized campaign today. Transparent, milestone-based funding powered by smart contracts.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm" className="h-9 gap-2 gradient-orange border-0 text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all">
            <Link to="/create">
              Start a Campaign <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-9 border-white/15 bg-white/[0.04] text-white/80 text-sm font-medium hover:bg-white/[0.08] hover:text-white active:scale-[0.98] transition-all">
            <Link to="/campaigns">Browse Projects</Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
