import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, Home, FolderOpen, Plus, User, Wallet } from "lucide-react";
import { mockCampaigns } from "@/data/mockData";
import { useWallet } from "@/contexts/WalletContext";

const pages = [
  { label: "Home", href: "/", icon: Home },
  { label: "Campaigns", href: "/campaigns", icon: FolderOpen },
  { label: "Create Campaign", href: "/create", icon: Plus },
  { label: "My Profile", href: "/profile", icon: User },
];

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { wallet } = useWallet();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Search (Cmd+K)"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search...</span>
        <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search campaigns, pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((p) => (
              <CommandItem key={p.href} onSelect={() => go(p.href)} className="gap-2 cursor-pointer">
                <p.icon className="h-4 w-4" /> {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Campaigns">
            {mockCampaigns.map((c) => (
              <CommandItem key={c.id} onSelect={() => go(`/campaign/${c.id}`)} className="gap-2 cursor-pointer">
                <FolderOpen className="h-4 w-4" /> {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {!wallet.connected && (
            <CommandGroup heading="Actions">
              <CommandItem className="gap-2 cursor-pointer">
                <Wallet className="h-4 w-4" /> Connect Wallet
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
