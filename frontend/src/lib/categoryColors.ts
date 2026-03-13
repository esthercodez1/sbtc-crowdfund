import { CampaignCategory } from "@/types/campaign";

export const CAMPAIGN_CATEGORIES: { value: CampaignCategory; label: string }[] = [
  { value: "defi", label: "DeFi" },
  { value: "nft", label: "NFT" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "governance", label: "Governance" },
  { value: "payments", label: "Payments" },
  { value: "social", label: "Social" },
];

export const categoryColors: Record<CampaignCategory, string> = {
  defi: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  nft: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  infrastructure: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  governance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  payments: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  social: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};
