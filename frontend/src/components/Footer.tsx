import { Link } from "react-router-dom";
import { Github, Twitter } from "lucide-react";

const navLinks = [
  { label: "Campaigns", href: "/campaigns" },
  { label: "Create", href: "/create" },
  { label: "My Profile", href: "/profile" },
];

const legalLinks = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-6">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-orange">
                <span className="text-xs font-bold text-primary-foreground">₿</span>
              </div>
              <span className="font-display text-sm font-bold">sBTC<span className="text-primary">Fund</span></span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
              Decentralized crowdfunding powered by Stacks and secured by Bitcoin.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-2.5">Navigation</h4>
            <ul className="space-y-1.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-2.5">Legal</h4>
            <ul className="space-y-1.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground mb-2.5">Community</h4>
            <div className="flex gap-2">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-success" />
              Built on Stacks
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-3 flex flex-col items-center gap-1 text-[11px] text-muted-foreground sm:flex-row sm:justify-between">
          <span>© 2026 sBTCFund. Powered by Stacks · Secured by Bitcoin</span>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
