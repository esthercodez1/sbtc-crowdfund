import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const stats = [
  { label: "Total Raised", value: 211200, suffix: " STX" },
  { label: "Campaigns", value: 48, suffix: "" },
  { label: "Success Rate", value: 87, suffix: "%" },
];

function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setCount(end); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = end / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(current));
          }, 2000 / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={heroRef} className="relative min-h-[60vh] sm:min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none animate-float" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-cosmic/[0.04] blur-[100px] pointer-events-none animate-float" style={{ animationDelay: "1.5s" }} />

      <motion.div
        className="container relative z-10 py-12"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm animate-pulse-glow"
          >
            <Zap className="h-3.5 w-3.5 text-primary" />
            Powered by Stacks + Bitcoin
          </motion.div>

          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            Fund the Future of{" "}
            <span className="text-gradient-orange">Bitcoin</span>
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed text-white/50 sm:text-base">
            Decentralized crowdfunding with milestone-based fund releases. Contribute STX and build the Bitcoin ecosystem together.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="sm" className="h-9 gap-2 gradient-orange border-0 text-primary-foreground text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all">
              <Link to="/campaigns">
                Explore Campaigns <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-9 border-white/15 bg-white/[0.04] text-white/80 text-sm font-medium hover:bg-white/[0.08] hover:text-white active:scale-[0.98] transition-all">
              <Link to="/create">Create Campaign</Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-0">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`flex-1 text-center ${i > 0 ? "border-l border-white/10" : ""}`}>
                <div className="font-display text-xl font-bold text-white sm:text-2xl tabular-nums">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-widest text-white/35 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
