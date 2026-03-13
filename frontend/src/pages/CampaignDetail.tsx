import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { categoryColors, CAMPAIGN_CATEGORIES } from "@/lib/categoryColors";
import { truncateAddress, formatSTX, getDaysLeft, getProgressPercentage, mockCampaigns, mockContributions } from "@/data/mockData";
import { getProgressColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWallet } from "@/contexts/WalletContext";
import { useState } from "react";
import ContributeModal from "@/components/ContributeModal";
import TransactionStatusModal, { TransactionStatus } from "@/components/TransactionStatusModal";
import SEOHead from "@/components/SEOHead";
import ErrorState from "@/components/ErrorState";
import Breadcrumbs from "@/components/Breadcrumbs";
import CampaignDetailSkeleton from "@/components/skeletons/CampaignDetailSkeleton";
import ImageWithFallback from "@/components/ImageWithFallback";
import { ArrowLeft, Calendar, Check, Clock, Copy, ExternalLink, FileText, MessageSquare, Share2, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";
import { useCampaign, useCampaignContributions, useCampaignUpdates } from "@/hooks/useCampaigns";

const statusColors: Record<string, string> = {
  active: "bg-success/20 text-success border-success/30",
  funded: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-cyan/20 text-cyan border-cyan/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function CampaignDetail() {
  const { id } = useParams();
  const campaignId = Number(id);
  const { data: campaign, isLoading, isError, refetch } = useCampaign(campaignId);
  const { data: contributions = [] } = useCampaignContributions(campaignId);
  const { data: updates = [] } = useCampaignUpdates(campaignId);

  const [contributeOpen, setContributeOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("signing");
  const [txAmount, setTxAmount] = useState("");
  const [backersOpen, setBackersOpen] = useState(false);
  const { wallet } = useWallet();
  const { toast } = useToast();

  const copyCreatorAddress = async () => {
    if (campaign) {
      await navigator.clipboard.writeText(campaign.creator);
      toast({ title: "Address copied", description: "Creator address copied to clipboard" });
    }
  };

  const handleContribute = (amount: string) => {
    setTxAmount(amount);
    setContributeOpen(false);
    setTxStatus("signing");
    setTxModalOpen(true);
    setTimeout(() => setTxStatus("broadcasting"), 2000);
    setTimeout(() => setTxStatus("pending"), 4000);
    setTimeout(() => setTxStatus("success"), 6000);
  };

  if (isError) {
    return (
      <Layout>
        <ErrorState
          title="Failed to load campaign"
          description="We couldn't load this campaign. Please try again."
          onRetry={() => refetch()}
        />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <CampaignDetailSkeleton />
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Campaign not found</h1>
          <Button asChild variant="ghost" className="mt-4 gap-2">
            <Link to="/campaigns"><ArrowLeft className="h-4 w-4" /> Back to Campaigns</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const progress = getProgressPercentage(campaign.raisedAmount, campaign.goalAmount);
  const daysLeft = getDaysLeft(campaign.endsAt);
  const completedMilestones = campaign.milestones.filter((m) => m.completed).length;
  const creatorInitials = campaign.creator.slice(0, 2).toUpperCase();

  return (
    <PageTransition>
    <Layout>
      <SEOHead
        title={`${campaign.title} | sBTCFund`}
        description={campaign.description.slice(0, 155)}
        ogType="article"
      />

      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden md:h-64">
        <ImageWithFallback src={campaign.imageUrl} alt={campaign.title} className="h-full w-full object-cover" fallbackClassName="h-full w-full" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container relative -mt-16 pb-14">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Campaigns", href: "/campaigns" }, { label: campaign.title }]} />

        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground">
          <Link to="/campaigns"><ArrowLeft className="h-4 w-4" /> All Campaigns</Link>
        </Button>

        <div className="flex flex-wrap items-start gap-3">
          <Badge className={`${statusColors[campaign.status]} border capitalize`}>{campaign.status}</Badge>
          <Badge className={`${categoryColors[campaign.category]} border text-xs`}>
            {CAMPAIGN_CATEGORIES.find(c => c.value === campaign.category)?.label}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Created {campaign.createdAt.toLocaleDateString()}
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">{campaign.title}</h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          by {truncateAddress(campaign.creator)}
          <button onClick={copyCreatorAddress} className="ml-2 text-primary hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="Copy creator address">
            <Copy className="inline h-3.5 w-3.5" />
          </button>
        </p>

        {/* Two-column */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-8">
            {/* Description */}
            <section>
              <h2 className="font-display text-lg font-semibold mb-4">About this Campaign</h2>
              <div className="prose prose-invert max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {campaign.description}
              </div>
            </section>

            {/* About the Creator */}
            <section>
              <h2 className="font-display text-lg font-semibold mb-4">About the Creator</h2>
              <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                  {creatorInitials}
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm text-foreground">{truncateAddress(campaign.creator)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> Member since {campaign.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {mockCampaigns.filter(c => c.creator === campaign.creator).length} campaigns</span>
                  </div>
                  <a href="#" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" /> View on Explorer
                  </a>
                </div>
              </div>
            </section>

            {/* Milestones */}
            <section>
              <h2 className="font-display text-lg font-semibold mb-4">Milestones</h2>
              <div className="space-y-4">
                {campaign.milestones.map((milestone, i) => (
                  <div key={milestone.id} className={`rounded-xl border p-4 transition-all duration-300 ${milestone.completed ? "border-success/30 bg-success/5" : "border-border bg-card"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${milestone.completed ? "bg-success text-success-foreground" : "border-2 border-muted-foreground/30 text-muted-foreground"}`}>
                        {milestone.completed ? <Check className="h-4 w-4 text-background" /> : <span className="text-xs font-semibold">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">{milestone.description}</h4>
                          <span className="text-sm font-mono text-muted-foreground">{milestone.percentage}%</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {milestone.completed ? "Completed" : "Pending"} · {formatSTX(Math.round(campaign.goalAmount * milestone.percentage / 100))} STX
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Campaign Updates */}
            {updates.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Updates
                </h2>
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="h-3 w-3" />
                        {update.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>
                      <h4 className="font-semibold text-foreground">{update.title}</h4>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{update.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Backers */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Recent Backers</h2>
                {contributions.length > 0 && (
                  <button onClick={() => setBackersOpen(true)} className="text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring rounded">
                    View All
                  </button>
                )}
              </div>
              {contributions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contributions yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {contributions.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
                      <div>
                        <p className="font-mono text-sm text-foreground">{truncateAddress(c.backer)}</p>
                        <p className="text-xs text-muted-foreground">{c.timestamp.toLocaleDateString()}</p>
                      </div>
                      <span className="font-semibold text-primary">{formatSTX(c.amount)} STX</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {/* Funding Card */}
            <Card className="border-border bg-card">
              <CardContent className="space-y-5 p-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-2xl font-bold text-foreground">{formatSTX(campaign.raisedAmount)}</span>
                    <span className="text-sm text-muted-foreground">of {formatSTX(campaign.goalAmount)} STX</span>
                  </div>
                  <div
                    className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${progress}% funded`}
                  >
                    <div className={`h-full rounded-full ${getProgressColor(progress)} transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{progress}% funded</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-secondary p-2.5 text-center">
                    <Users className="mx-auto h-4 w-4 text-muted-foreground" />
                    <p className="mt-1 font-semibold text-foreground">{campaign.backerCount}</p>
                    <p className="text-xs text-muted-foreground">Backers</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-2.5 text-center">
                    <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
                    <p className="mt-1 font-semibold text-foreground">{daysLeft}</p>
                    <p className="text-xs text-muted-foreground">Days Left</p>
                  </div>
                </div>

                {campaign.status === "active" && (
                  <Button
                    onClick={() => setContributeOpen(true)}
                    className="w-full h-10 text-sm gradient-orange border-0 text-primary-foreground hover:opacity-90 animate-pulse-glow active:scale-[0.98] transition-transform"
                  >
                    Contribute STX
                  </Button>
                )}

                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <button className="flex items-center gap-1 text-xs hover:text-primary focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="Share campaign">
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                  <button className="flex items-center gap-1 text-xs hover:text-primary focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="View on explorer">
                    <ExternalLink className="h-3.5 w-3.5" /> Explorer
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Milestone Summary */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base">Milestone Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaign.milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      m.completed ? "bg-success text-background" : "border border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {m.completed ? <Check className="h-3 w-3" /> : i + 1}
                    </div>
                    <span className={`text-sm ${m.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {m.description}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  {completedMilestones}/{campaign.milestones.length} milestones completed
                </p>
              </CardContent>
            </Card>

            {/* Your Contribution */}
            {wallet.connected && (() => {
                const myContrib = mockContributions.filter(c => c.backer === wallet.address && c.campaignId === campaign.id);
                const totalContrib = myContrib.reduce((sum, c) => sum + c.amount, 0);
                const latestContrib = myContrib[0];
                if (totalContrib === 0) return null;
                return (
              <Card className="border-primary/20 bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-base">Your Contribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-2xl font-bold text-primary">{formatSTX(totalContrib)} STX</p>
                  <p className="text-xs text-muted-foreground mt-1">Contributed on {latestContrib?.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  {campaign.status === "failed" && (
                    <Button variant="outline" size="sm" className="mt-4 w-full border-destructive text-destructive hover:bg-destructive/10">
                      Claim Refund
                    </Button>
                  )}
                </CardContent>
              </Card>
                );
              })()}
          </div>
        </div>
      </div>

      {/* Transaction status aria-live region */}
      <div aria-live="polite" className="sr-only">
        {txModalOpen && `Transaction status: ${txStatus}`}
      </div>

      {/* View All Backers Modal */}
      <Dialog open={backersOpen} onOpenChange={setBackersOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">All Backers</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-4">
              {contributions.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                  <div>
                    <p className="font-mono text-sm text-foreground">{truncateAddress(c.backer)}</p>
                    <p className="text-xs text-muted-foreground">{c.timestamp.toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-primary">{formatSTX(c.amount)} STX</span>
                </div>
              ))}
              {contributions.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No contributions yet.</p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <ContributeModal open={contributeOpen} onOpenChange={setContributeOpen} campaign={campaign} onContribute={handleContribute} />
      <TransactionStatusModal
        open={txModalOpen}
        onOpenChange={setTxModalOpen}
        status={txStatus}
        amount={txAmount}
        campaignTitle={campaign.title}
        txHash="0x8a3f...b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8"
        onRetry={() => {
          setTxStatus("signing");
          setTimeout(() => setTxStatus("broadcasting"), 2000);
          setTimeout(() => setTxStatus("pending"), 4000);
          setTimeout(() => setTxStatus("success"), 6000);
        }}
      />
    </Layout>
    </PageTransition>
  );
}
