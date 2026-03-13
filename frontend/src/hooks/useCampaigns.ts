import { useQuery } from "@tanstack/react-query";
import {
  fetchAllCampaigns,
  fetchCampaignById,
  getContribution,
  getCurrentBlockHeight,
  ustxToStx,
  type FullCampaign,
} from "@/lib/stacks";
import { Campaign, Contribution, CampaignStatus, Milestone } from "@/types/campaign";

// ── Transform contract data to frontend types ───────────────────────────────

async function deriveStatus(c: FullCampaign, blockHeight: number): Promise<CampaignStatus> {
  if (c.finalized) return "completed";
  const goalReached = c.raised >= c.goal;
  const ended = blockHeight > c.deadline;
  if (goalReached && !c.finalized) return "funded";
  if (ended && !goalReached) return "failed";
  return "active";
}

function estimateDate(blockHeight: number, currentBlock: number): Date {
  // ~10 min per Bitcoin block
  const blockDiff = blockHeight - currentBlock;
  const now = Date.now();
  return new Date(now + blockDiff * 10 * 60 * 1000);
}

async function toCampaign(c: FullCampaign): Promise<Campaign> {
  const blockHeight = await getCurrentBlockHeight();
  const status = await deriveStatus(c, blockHeight);

  const milestones: Milestone[] = c.milestones.map((m, i) => ({
    id: i,
    description: m.description,
    percentage: m.percentage,
    completed: m.completed,
  }));

  return {
    id: c.id,
    title: c.title,
    description: "", // contract doesn't store long descriptions
    creator: c.creator,
    goalAmount: ustxToStx(c.goal),
    raisedAmount: ustxToStx(c.raised),
    backerCount: 0, // not tracked in contract, could be indexed
    status,
    milestones,
    createdAt: estimateDate(c.createdAt, blockHeight),
    endsAt: estimateDate(c.deadline, blockHeight),
    imageUrl: "",
    category: "infrastructure", // default — contract doesn't store this
  };
}

async function fetchAndTransformCampaigns(): Promise<Campaign[]> {
  const raw = await fetchAllCampaigns();
  return Promise.all(raw.map(toCampaign));
}

async function fetchAndTransformCampaign(id: number): Promise<Campaign | undefined> {
  const raw = await fetchCampaignById(id);
  if (!raw) return undefined;
  return toCampaign(raw);
}

// ── React Query hooks ───────────────────────────────────────────────────────

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchAndTransformCampaigns,
    staleTime: 30_000, // cache for 30s
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchAndTransformCampaign(id),
    enabled: id > 0,
    staleTime: 15_000,
  });
}

export function useMyContribution(campaignId: number, address: string | null) {
  return useQuery({
    queryKey: ["contribution", campaignId, address],
    queryFn: async () => {
      if (!address) return null;
      const contrib = await getContribution(campaignId, address);
      if (!contrib || contrib.amount === 0) return null;
      return {
        amount: ustxToStx(contrib.amount),
        refunded: contrib.refunded,
      };
    },
    enabled: campaignId > 0 && !!address,
    staleTime: 15_000,
  });
}

// Keep empty hooks for contributions/updates - these could be indexed from events
export function useCampaignContributions(_campaignId: number) {
  return useQuery<Contribution[]>({
    queryKey: ["contributions", _campaignId],
    queryFn: async () => {
      // Contract doesn't expose a list of backers
      // In production, index contribution events from the API
      return [];
    },
    staleTime: 60_000,
  });
}

export interface CampaignUpdate {
  id: string;
  campaignId: number;
  title: string;
  content: string;
  date: Date;
}

export function useCampaignUpdates(_campaignId: number) {
  return useQuery<CampaignUpdate[]>({
    queryKey: ["updates", _campaignId],
    queryFn: async () => [],
    staleTime: 60_000,
  });
}
