import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Wallet, ChevronDown, LogOut, User, Copy, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { truncateAddress } from "@/data/mockData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import CommandMenu from "@/components/CommandMenu";
import Identicon from "@/components/Identicon";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/create", label: "Create" },
  { href: "/profile", label: "My Profile" },
];

export default function Navbar({ scrolled }: { scrolled?: boolean }) {
  const { wallet, disconnectWallet } = useWallet();
  const [connectOpen, setConnectOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const copyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      toast({ title: "Address copied", description: "Wallet address copied to clipboard" });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({ title: "Wallet disconnected", description: "Your wallet has been disconnected" });
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 h-16 glass transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-background/50" : ""}`}>
        <div className="container flex h-full items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-orange">
              <span className="text-lg font-bold text-primary-foreground">₿</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              sBTC<span className="text-primary">Fund</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground ${
                  location.pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet / CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <CommandMenu />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            {wallet.connected && wallet.address ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-border bg-secondary font-mono text-sm">
                    <Identicon address={wallet.address} size={20} />
                    {truncateAddress(wallet.address)}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <DropdownMenuItem onClick={copyAddress} className="gap-2 text-muted-foreground cursor-pointer">
                    <Copy className="h-4 w-4" /> Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="gap-2 text-muted-foreground">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnect} className="gap-2 text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4" /> Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setConnectOpen(true)} className="gap-2 gradient-orange border-0 text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-transform">
                <Wallet className="h-4 w-4" /> Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full border-border bg-background">
              <div className="flex flex-col gap-6 pt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary"
                    onClick={() => setSheetOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4">
                  {wallet.connected ? (
                    <Button variant="outline" onClick={handleDisconnect} className="w-full gap-2">
                      <LogOut className="h-4 w-4" /> Disconnect
                    </Button>
                  ) : (
                    <Button onClick={() => { setConnectOpen(true); setSheetOpen(false); }} className="w-full gap-2 gradient-orange border-0 text-primary-foreground">
                      <Wallet className="h-4 w-4" /> Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </nav>

      <ConnectWalletModal open={connectOpen} onOpenChange={setConnectOpen} />
    </>
  );
}
