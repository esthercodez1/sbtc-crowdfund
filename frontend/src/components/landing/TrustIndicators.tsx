import { motion } from "framer-motion";
import { Shield, Target, RefreshCw, Eye } from "lucide-react";
import { sectionVariants, staggerContainer, childVariants } from "./shared";

const trustIndicators = [
  { icon: Shield, title: "Bitcoin Security", description: "Secured by Bitcoin's proof-of-work through the Stacks layer" },
  { icon: Target, title: "Milestone Protection", description: "Funds released only when milestones are completed" },
  { icon: RefreshCw, title: "Automatic Refunds", description: "Smart contract ensures refunds if campaign fails" },
  { icon: Eye, title: "Fully Transparent", description: "All transactions and milestones visible on-chain" },
];

export default function TrustIndicators() {
  return (
    <motion.section
      className="py-14 bg-background"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="container max-w-4xl">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Security</p>
          <h2 className="mt-1 font-display text-2xl font-bold">
            Built on <span className="text-gradient-orange">Bitcoin</span>
          </h2>
        </div>
        <motion.div
          className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          {trustIndicators.map((item) => (
            <motion.div
              key={item.title}
              variants={childVariants}
              className="group rounded-xl border border-border bg-card p-4 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-105">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
