import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConnectWalletModal({ open, onOpenChange }: Props) {
  const { connectWallet } = useWallet();
  const { toast } = useToast();

  const handleConnect = (provider: "hiro" | "xverse") => {
    connectWallet(provider);
    onOpenChange(false);
    toast({ title: "Wallet connected", description: `Connected via ${provider === "hiro" ? "Hiro" : "Xverse"} Wallet` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Connect Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a wallet to connect to the Stacks network
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => handleConnect("hiro")}
            className="h-14 justify-start gap-4 border border-border bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.98] transition-transform"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Hiro Wallet</div>
              <div className="text-xs text-muted-foreground">Recommended</div>
            </div>
          </Button>

          <Button
            onClick={() => handleConnect("xverse")}
            className="h-14 justify-start gap-4 border border-border bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.98] transition-transform"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Wallet className="h-5 w-5 text-accent" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Xverse Wallet</div>
              <div className="text-xs text-muted-foreground">Mobile & Desktop</div>
            </div>
          </Button>
        </div>

        <div className="pt-2 text-center">
          <a
            href="https://www.hiro.so/wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            Don't have a wallet? <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
