import { useQuery } from "@tanstack/react-query";
import { mockCampaigns, mockContributions, mockUpdates } from "@/data/mockData";
import { Campaign, Contribution } from "@/types/campaign";
import { CampaignUpdate } from "@/data/mockData";

// Simulates async data fetch — replace with real API calls later
function fetchCampaigns(): Promise<Campaign[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCampaigns), 300);
  });
}

function fetchCampaign(id: number): Promise<Campaign | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCampaigns.find((c) => c.id === id)), 200);
  });
}

function fetchContributions(campaignId: number): Promise<Contribution[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockContributions.filter((c) => c.campaignId === campaignId)), 100);
  });
}

function fetchUpdates(campaignId: number): Promise<CampaignUpdate[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUpdates.filter((u) => u.campaignId === campaignId)), 100);
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => fetchCampaign(id),
    enabled: id > 0,
  });
}

export function useCampaignContributions(campaignId: number) {
  return useQuery({
    queryKey: ["contributions", campaignId],
    queryFn: () => fetchContributions(campaignId),
    enabled: campaignId > 0,
  });
}

export function useCampaignUpdates(campaignId: number) {
  return useQuery({
    queryKey: ["updates", campaignId],
    queryFn: () => fetchUpdates(campaignId),
    enabled: campaignId > 0,
  });
}
