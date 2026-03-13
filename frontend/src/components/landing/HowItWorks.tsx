import { motion } from "framer-motion";
import { Rocket, Coins, CheckCircle } from "lucide-react";
import { sectionVariants, staggerContainer, childVariants } from "./shared";

const howItWorks = [
  { icon: Rocket, title: "Create", description: "Launch your campaign with milestones and a clear funding goal.", step: "01" },
  { icon: Coins, title: "Fund", description: "Contributors back projects with STX. Funds are locked in a smart contract.", step: "02" },
  { icon: CheckCircle, title: "Deliver", description: "Complete milestones to unlock funds. Backers get refunds if goals aren't met.", step: "03" },
];

export default function HowItWorks() {
  return (
    <motion.section
      className="py-16 bg-background"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="container max-w-4xl">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">How It Works</p>
          <h2 className="mt-1 font-display text-2xl font-bold">Three simple steps</h2>
        </div>
        <motion.div
          className="mt-10 relative"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
        >
          <div className="hidden sm:block absolute top-[3.25rem] left-[16.666%] right-[16.666%] h-px border-t-2 border-dashed border-primary/20 z-0" />

          <div className="grid gap-8 sm:grid-cols-3 sm:gap-6 relative z-10">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                variants={childVariants}
                className="group flex flex-col items-center text-center relative"
              >
                {i < howItWorks.length - 1 && (
                  <div className="sm:hidden absolute top-[4.5rem] left-1/2 -translate-x-1/2 h-8 border-l-2 border-dashed border-primary/20 z-0" />
                )}

                <div className="relative mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-orange shadow-lg transition-all duration-300 group-hover:glow-orange group-hover:scale-105">
                    <step.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border-2 border-primary text-[10px] font-bold text-primary font-mono">
                    {step.step}
                  </span>
                </div>

                <h3 className="font-display text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground max-w-[220px]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
