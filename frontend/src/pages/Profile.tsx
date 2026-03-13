import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { useWallet } from "@/contexts/WalletContext";
import { truncateAddress, formatSTX } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCard from "@/components/CampaignCard";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import SEOHead from "@/components/SEOHead";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Wallet, Coins, RefreshCw, FolderOpen } from "lucide-react";
import Identicon from "@/components/Identicon";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";
import { useCampaigns } from "@/hooks/useCampaigns";
import { explorerAddressUrl } from "@/lib/stacks";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Profile() {
  const { wallet, connectWallet } = useWallet();
  const { toast } = useToast();
  const { data: allCampaigns = [], isLoading: campaignsLoading } = useCampaigns();

  const loading = campaignsLoading;

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
          onAction={() => connectWallet()}
        />
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

  const myCampaigns = allCampaigns.filter((c) => c.creator === wallet.address);

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
              <a href={explorerAddressUrl(wallet.address!)} target="_blank" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1" rel="noopener noreferrer">
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
              <EmptyState
                icon={Coins}
                title="Contribution tracking coming soon"
                description="On-chain contribution history will be available in a future update"
                actionLabel="Explore Campaigns"
                actionHref="/campaigns"
              />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
              <EmptyState
                icon={RefreshCw}
                title="Activity feed coming soon"
                description="Transaction history will be indexed from on-chain events"
              />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
    </PageTransition>
  );
}
