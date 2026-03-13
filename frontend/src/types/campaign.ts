export type CampaignStatus = "active" | "funded" | "completed" | "failed";
export type CampaignCategory = "defi" | "nft" | "infrastructure" | "governance" | "payments" | "social";

export interface Milestone {
  id: number;
  description: string;
  percentage: number;
  completed: boolean;
}

export interface Contribution {
  id: string;
  backer: string;
  amount: number;
  timestamp: Date;
  campaignId: number;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  creator: string;
  goalAmount: number;
  raisedAmount: number;
  backerCount: number;
  status: CampaignStatus;
  milestones: Milestone[];
  createdAt: Date;
  endsAt: Date;
  imageUrl: string;
  category: CampaignCategory;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
  network: "testnet" | "mainnet";
}
