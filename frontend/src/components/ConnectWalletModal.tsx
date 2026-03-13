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

  const handleConnect = async () => {
    try {
      await connectWallet();
      onOpenChange(false);
      toast({ title: "Wallet connected", description: "Connected via Stacks wallet" });
    } catch (err) {
      toast({ title: "Connection failed", description: "Could not connect wallet. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Connect Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your Stacks wallet to interact with the network
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleConnect}
            className="h-14 justify-start gap-4 border border-border bg-secondary text-foreground hover:bg-secondary/80 active:scale-[0.98] transition-transform"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Connect Stacks Wallet</div>
              <div className="text-xs text-muted-foreground">Hiro, Xverse, or any SIP-030 wallet</div>
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
