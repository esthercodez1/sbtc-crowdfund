import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, Hourglass, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export type TransactionStatus = "signing" | "broadcasting" | "pending" | "success" | "error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: TransactionStatus;
  amount?: string;
  campaignTitle?: string;
  txHash?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

const statusConfig: Record<TransactionStatus, { icon: React.ElementType; title: string; description: string; color: string }> = {
  signing: {
    icon: Wallet,
    title: "Confirm in your wallet",
    description: "Please approve the transaction in your wallet extension",
    color: "text-primary",
  },
  broadcasting: {
    icon: Loader2,
    title: "Broadcasting transaction...",
    description: "Your transaction is being sent to the network",
    color: "text-primary",
  },
  pending: {
    icon: Hourglass,
    title: "Waiting for confirmation",
    description: "Transaction is being confirmed on-chain",
    color: "text-warning-amber",
  },
  success: {
    icon: CheckCircle,
    title: "Transaction successful!",
    description: "Your contribution has been confirmed",
    color: "text-success",
  },
  error: {
    icon: XCircle,
    title: "Transaction failed",
    description: "Something went wrong with your transaction",
    color: "text-destructive",
  },
};

// CSS confetti
function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-sm animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            background: `hsl(${Math.random() * 360}, 80%, 60%)`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 1.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function TransactionStatusModal({
  open,
  onOpenChange,
  status,
  amount,
  campaignTitle,
  txHash,
  errorMessage,
  onRetry,
  onClose,
}: Props) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isTerminal = status === "success" || status === "error";

  return (
    <Dialog open={open} onOpenChange={isTerminal ? onOpenChange : undefined}>
      <DialogContent
        className="border-border bg-card sm:max-w-sm text-center relative overflow-hidden"
        onInteractOutside={(e) => { if (!isTerminal) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (!isTerminal) e.preventDefault(); }}
      >
        {status === "success" && <Confetti />}
        <DialogHeader className="items-center relative z-10">
          <div className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl ${
            status === "success" ? "bg-success/10" : status === "error" ? "bg-destructive/10" : "bg-primary/10"
          }`}>
            <Icon className={`h-8 w-8 ${config.color} ${
              status === "signing" ? "animate-pulse" :
              status === "broadcasting" ? "animate-spin" :
              status === "pending" ? "animate-pulse" :
              status === "success" ? "animate-scale-in" :
              status === "error" ? "animate-scale-in" : ""
            }`} />
          </div>
          <DialogTitle className="font-display text-xl">{config.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {status === "error" && errorMessage ? errorMessage : config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 relative z-10">
          {amount && campaignTitle && status === "success" && (
            <div className="rounded-lg bg-secondary p-4 space-y-1">
              <p className="font-mono text-lg font-semibold text-foreground">{amount} STX</p>
              <p className="text-xs text-muted-foreground">contributed to {campaignTitle}</p>
            </div>
          )}

          {txHash && (status === "pending" || status === "success") && (
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
              <p className="font-mono text-xs text-foreground break-all">{txHash}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="gap-2 border-border"
                onClick={() => window.open(`https://explorer.stacks.co/txid/${txHash || ""}?chain=testnet`, "_blank")}
              >
                <ExternalLink className="h-4 w-4" /> View on Explorer
              </Button>
              <Button
                className="gradient-orange border-0 text-primary-foreground hover:opacity-90"
                onClick={() => { onClose?.(); onOpenChange(false); }}
              >
                Done
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gradient-orange border-0 text-primary-foreground hover:opacity-90"
                onClick={onRetry}
              >
                Try Again
              </Button>
            </div>
          )}

          {!isTerminal && (
            <p className="text-xs text-muted-foreground animate-pulse">
              {status === "signing" ? "Waiting for wallet approval..." :
               status === "broadcasting" ? "This may take a few seconds..." :
               "Typically takes 10-30 seconds..."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
