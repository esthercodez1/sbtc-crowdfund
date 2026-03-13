import { Campaign, Contribution } from "@/types/campaign";

export const mockCampaigns: Campaign[] = [
  {
    id: 1,
    title: "Decentralized Bitcoin Marketplace",
    description: "Building a peer-to-peer marketplace for digital goods, powered by sBTC and Clarity smart contracts. Trade securely without intermediaries.\n\nOur marketplace enables creators to sell digital products directly to consumers with escrow protection and automatic dispute resolution built into the smart contract layer.\n\n## Key Features\n- Escrow-protected transactions\n- Reputation system on-chain\n- Multi-sig dispute resolution\n- Zero platform fees for the first year",
    creator: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    goalAmount: 50000,
    raisedAmount: 32500,
    backerCount: 147,
    status: "active",
    milestones: [
      { id: 1, description: "Smart contract development and audit", percentage: 30, completed: true },
      { id: 2, description: "Frontend MVP and beta testing", percentage: 40, completed: false },
      { id: 3, description: "Public launch and marketing", percentage: 30, completed: false },
    ],
    createdAt: new Date("2025-12-01"),
    endsAt: new Date("2026-03-15"),
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop",
    category: "infrastructure",
  },
  {
    id: 2,
    title: "Bitcoin DeFi Analytics Dashboard",
    description: "Real-time analytics and portfolio tracking for Stacks DeFi protocols. Monitor yields, track positions, and optimize your Bitcoin DeFi strategy.",
    creator: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE",
    goalAmount: 25000,
    raisedAmount: 25000,
    backerCount: 89,
    status: "funded",
    milestones: [
      { id: 1, description: "Data aggregation infrastructure", percentage: 25, completed: true },
      { id: 2, description: "Dashboard UI and charting", percentage: 35, completed: true },
      { id: 3, description: "Portfolio tracking features", percentage: 25, completed: false },
      { id: 4, description: "Mobile app and notifications", percentage: 15, completed: false },
    ],
    createdAt: new Date("2025-10-15"),
    endsAt: new Date("2026-01-15"),
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    category: "defi",
  },
  {
    id: 3,
    title: "sBTC Payment Gateway",
    description: "A simple payment gateway that lets merchants accept sBTC payments with automatic conversion and settlement. Powered by Stacks smart contracts.",
    creator: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    goalAmount: 75000,
    raisedAmount: 75000,
    backerCount: 312,
    status: "completed",
    milestones: [
      { id: 1, description: "Payment contract and API", percentage: 40, completed: true },
      { id: 2, description: "Merchant dashboard", percentage: 30, completed: true },
      { id: 3, description: "Integration plugins", percentage: 30, completed: true },
    ],
    createdAt: new Date("2025-06-01"),
    endsAt: new Date("2025-09-01"),
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop",
    category: "payments",
  },
  {
    id: 4,
    title: "Bitcoin-Backed NFT Collection",
    description: "A generative art collection secured by Bitcoin through Stacks. Each piece is algorithmically created and permanently stored on-chain.",
    creator: "SP2C2YFP12AJZB1D9NKFNB4THKQP8QZRJ0KVEEL1B",
    goalAmount: 15000,
    raisedAmount: 3200,
    backerCount: 23,
    status: "active",
    milestones: [
      { id: 1, description: "Art generation algorithm", percentage: 40, completed: false },
      { id: 2, description: "Minting smart contract", percentage: 30, completed: false },
      { id: 3, description: "Gallery and marketplace", percentage: 30, completed: false },
    ],
    createdAt: new Date("2026-01-20"),
    endsAt: new Date("2026-04-20"),
    imageUrl: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&h=450&fit=crop",
    category: "nft",
  },
  {
    id: 5,
    title: "Stacks DAO Governance Tool",
    description: "On-chain governance tooling for DAOs on Stacks. Proposal creation, voting, treasury management, and delegation — all transparent on Bitcoin.",
    creator: "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB",
    goalAmount: 40000,
    raisedAmount: 8500,
    backerCount: 56,
    status: "failed",
    milestones: [
      { id: 1, description: "Governance contract suite", percentage: 35, completed: false },
      { id: 2, description: "Voting and delegation UI", percentage: 35, completed: false },
      { id: 3, description: "Treasury management", percentage: 30, completed: false },
    ],
    createdAt: new Date("2025-08-01"),
    endsAt: new Date("2025-11-01"),
    imageUrl: "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=800&h=450&fit=crop",
    category: "governance",
  },
  {
    id: 6,
    title: "Bitcoin Lightning Bridge",
    description: "Bridging Lightning Network payments to Stacks DeFi. Instant, low-fee transfers between the two most powerful Bitcoin layers.",
    creator: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
    goalAmount: 100000,
    raisedAmount: 67000,
    backerCount: 234,
    status: "active",
    milestones: [
      { id: 1, description: "Bridge protocol design and audit", percentage: 25, completed: true },
      { id: 2, description: "Relayer network infrastructure", percentage: 30, completed: true },
      { id: 3, description: "User interface and SDK", percentage: 25, completed: false },
      { id: 4, description: "Mainnet launch and liquidity", percentage: 20, completed: false },
    ],
    createdAt: new Date("2025-11-01"),
    endsAt: new Date("2026-05-01"),
    imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=450&fit=crop",
    category: "infrastructure",
  },
];

export const mockContributions: Contribution[] = [
  { id: "1", backer: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", amount: 500, timestamp: new Date("2026-02-20"), campaignId: 1 },
  { id: "2", backer: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE", amount: 1000, timestamp: new Date("2026-02-19"), campaignId: 1 },
  { id: "3", backer: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amount: 250, timestamp: new Date("2026-02-18"), campaignId: 1 },
  { id: "4", backer: "SP2C2YFP12AJZB1D9NKFNB4THKQP8QZRJ0KVEEL1B", amount: 2000, timestamp: new Date("2026-02-17"), campaignId: 6 },
  { id: "5", backer: "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB", amount: 750, timestamp: new Date("2026-02-16"), campaignId: 4 },
];

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatSTX(amount: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
}

export function getDaysLeft(endsAt: Date): number {
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getProgressPercentage(raised: number, goal: number): number {
  return Math.min(100, Math.round((raised / goal) * 100));
}

export interface Activity {
  id: string;
  type: "created" | "contributed" | "milestone" | "refund";
  description: string;
  timestamp: Date;
  campaignId?: number;
  amount?: number;
}

export const mockActivities: Activity[] = [
  { id: "a1", type: "contributed", description: "Contributed 500 STX to Decentralized Bitcoin Marketplace", timestamp: new Date("2026-02-20"), campaignId: 1, amount: 500 },
  { id: "a2", type: "created", description: "Created campaign: Bitcoin Lightning Bridge", timestamp: new Date("2026-02-18"), campaignId: 6 },
  { id: "a3", type: "milestone", description: "Milestone 1 completed for sBTC Payment Gateway", timestamp: new Date("2026-02-15"), campaignId: 3 },
  { id: "a4", type: "contributed", description: "Contributed 2,000 STX to Bitcoin Lightning Bridge", timestamp: new Date("2026-02-10"), campaignId: 6, amount: 2000 },
  { id: "a5", type: "refund", description: "Refund received from Stacks DAO Governance Tool", timestamp: new Date("2026-01-25"), campaignId: 5, amount: 750 },
  { id: "a6", type: "contributed", description: "Contributed 1,000 STX to Bitcoin DeFi Analytics Dashboard", timestamp: new Date("2026-01-12"), campaignId: 2, amount: 1000 },
];

export interface CampaignUpdate {
  id: string;
  campaignId: number;
  title: string;
  content: string;
  date: Date;
}

export const mockUpdates: CampaignUpdate[] = [
  { id: "u1", campaignId: 1, title: "Smart Contract Audit Complete", content: "We've completed the security audit with CertiK. All critical findings have been addressed and the contracts are now ready for testnet deployment.", date: new Date("2026-02-15") },
  { id: "u2", campaignId: 1, title: "Beta Testing Begins", content: "Excited to announce that our beta testing phase has begun! We've onboarded 50 initial testers and are collecting feedback on the marketplace UI.", date: new Date("2026-02-01") },
  { id: "u3", campaignId: 6, title: "Bridge Protocol Design Finalized", content: "The bridge protocol specification has been finalized and peer-reviewed. We're now moving into the implementation phase with our relayer network.", date: new Date("2026-01-20") },
  { id: "u4", campaignId: 2, title: "Dashboard V2 Released", content: "We've shipped the v2 of our analytics dashboard with improved charting, real-time data feeds, and support for 12 new DeFi protocols on Stacks.", date: new Date("2026-01-10") },
];
