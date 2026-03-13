import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { mockCampaigns, mockContributions, mockActivities, truncateAddress, formatSTX } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCard from "@/components/CampaignCard";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import SEOHead from "@/components/SEOHead";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Wallet, Coins, Rocket, CheckCircle, RefreshCw, FolderOpen } from "lucide-react";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import Identicon from "@/components/Identicon";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const activityIcons: Record<string, React.ElementType> = {
  created: Rocket,
  contributed: Coins,
  milestone: CheckCircle,
  refund: RefreshCw,
};

export default function Profile() {
  const { wallet } = useWallet();
  const [connectOpen, setConnectOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const copyAddress = async () => {
    if (wallet.address) {
      await navigator.clipboard.writeText(wallet.address);
      toast({ title: "Address copied", description: "Wallet address copied to clipboard" });
    }
  };

  if (!wallet.connected) {
    return (
      <PageTransition>
      <Layout>
        <SEOHead title="My Profile | sBTCFund" description="View your sBTCFund profile, campaigns, and contributions." />
        <EmptyState
          icon={Wallet}
          title="Connect Your Wallet"
          description="Connect your wallet to view your profile and campaigns"
          actionLabel="Connect Wallet"
          onAction={() => setConnectOpen(true)}
        />
        <ConnectWalletModal open={connectOpen} onOpenChange={setConnectOpen} />
      </Layout>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <Layout>
        <ProfileSkeleton />
      </Layout>
    );
  }

  const myCampaigns = mockCampaigns.filter((c) => c.creator === wallet.address);
  const myContributions = mockContributions.filter((c) => c.backer === wallet.address);

  return (
    <PageTransition>
    <Layout>
      <SEOHead title="My Profile | sBTCFund" description="View your sBTCFund profile, campaigns, and contributions." />
      <div className="container py-10">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "My Profile" }]}
          title={truncateAddress(wallet.address!)}
        />

        {/* Profile Header */}
        <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
          <Identicon address={wallet.address!} size={48} className="rounded-2xl" />
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Badge variant="outline" className="border-border font-mono text-xs">Testnet</Badge>
              <button onClick={copyAddress} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="Copy wallet address">
                <Copy className="h-3 w-3" /> Copy
              </button>
              <a href="#" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" /> Explorer
              </a>
            </div>
            <p className="mt-3 font-mono text-base font-semibold text-foreground">
              {formatSTX(wallet.balance)} <span className="text-muted-foreground text-sm font-normal">STX</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="mt-8">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="contributions">My Contributions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            {myCampaigns.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No campaigns yet"
                description="You haven't created any campaigns yet"
                actionLabel="Create Your First Campaign"
                actionHref="/create"
              />
            ) : (
              <motion.div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {myCampaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="contributions" className="mt-6">
            {myContributions.length === 0 ? (
              <EmptyState
                icon={Coins}
                title="No contributions yet"
                description="You haven't contributed to any campaigns yet"
                actionLabel="Explore Campaigns"
                actionHref="/campaigns"
              />
            ) : (
              <div className="space-y-3">
                {myContributions.map((c) => {
                  const campaign = mockCampaigns.find((camp) => camp.id === c.campaignId);
                  return (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-secondary/50">
                      <div>
                        <p className="font-semibold text-foreground">{campaign?.title || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{c.timestamp.toLocaleDateString()}</p>
                      </div>
                      <span className="font-mono font-semibold text-primary">{formatSTX(c.amount)} STX</span>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="space-y-4">
              {mockActivities.map((activity) => {
                const Icon = activityIcons[activity.type] || Coins;
                return (
                    <div key={activity.id} className="flex items-start gap-4 rounded-xl border border-border bg-card p-3.5 transition-colors hover:bg-secondary/50">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      activity.type === "contributed" ? "bg-primary/10 text-primary" :
                      activity.type === "created" ? "bg-success/10 text-success" :
                      activity.type === "milestone" ? "bg-cyan/10 text-cyan" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.description}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{activity.timestamp.toLocaleDateString()}</span>
                        {activity.amount && (
                          <span className="font-mono text-xs font-semibold text-primary">{formatSTX(activity.amount)} STX</span>
                        )}
                      </div>
                    </div>
                    <a href="#" className="text-xs text-muted-foreground hover:text-primary" aria-label="View on explorer" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
    </PageTransition>
  );
}
