import {
  fetchCallReadOnlyFunction,
  cvToValue,
  Cl,
  type ClarityValue,
} from "@stacks/transactions";

// ── Contract Configuration ──────────────────────────────────────────────────
export const CONTRACT_ADDRESS = "STZPZY7NEZERJKZCB2ZZE3XVENKDZD031TBYSQJD";
export const CONTRACT_NAME = "sbtc-crowdfund";

type StacksNetwork = "testnet" | "mainnet";
export const NETWORK: StacksNetwork = "testnet" as StacksNetwork;

export const STACKS_API_BASE =
  NETWORK === "mainnet"
    ? "https://api.mainnet.hiro.so"
    : "https://api.testnet.hiro.so";

export const EXPLORER_BASE =
  NETWORK === "mainnet"
    ? "https://explorer.hiro.so"
    : "https://explorer.hiro.so";

export function explorerTxUrl(txId: string): string {
  const cleanId = txId.startsWith("0x") ? txId : `0x${txId}`;
  return `${EXPLORER_BASE}/txid/${cleanId}?chain=${NETWORK}`;
}

export function explorerAddressUrl(address: string): string {
  return `${EXPLORER_BASE}/address/${address}?chain=${NETWORK}`;
}

// ── Micro-STX helpers ───────────────────────────────────────────────────────
// The contract uses micro-STX (1 STX = 1_000_000 uSTX)
export const USTX_PER_STX = 1_000_000;
export function stxToUstx(stx: number): number {
  return Math.round(stx * USTX_PER_STX);
}
export function ustxToStx(ustx: number | bigint): number {
  return Number(ustx) / USTX_PER_STX;
}

// ── Read-only call helper ───────────────────────────────────────────────────
async function callReadOnly(
  functionName: string,
  functionArgs: ClarityValue[] = [],
  senderAddress: string = CONTRACT_ADDRESS
) {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    senderAddress,
    network: NETWORK,
  });
  return result;
}

// ── Contract Read Functions ─────────────────────────────────────────────────

export async function getTotalCampaigns(): Promise<number> {
  const result = await callReadOnly("get-total-campaigns");
  const val = cvToValue(result, true);
  return Number(val);
}

export interface ContractCampaign {
  creator: string;
  title: string;
  goal: number;
  raised: number;
  deadline: number;
  "milestone-count": number;
  "milestones-completed": number;
  finalized: boolean;
  "created-at": number;
}

export async function getCampaign(
  campaignId: number
): Promise<ContractCampaign | null> {
  const result = await callReadOnly("get-campaign", [Cl.uint(campaignId)]);
  const val = cvToValue(result, true);
  if (!val || typeof val !== "object") return null;
  // cvToValue may return nested .value for optional/response wrappers
  const data = "value" in val && typeof val.value === "object" && val.value !== null
    ? (val.value as Record<string, unknown>)
    : (val as Record<string, unknown>);
  if (!data.creator) return null;
  return {
    creator: String(data.creator),
    title: String(data.title ?? ""),
    goal: Number(data.goal ?? 0),
    raised: Number(data.raised ?? 0),
    deadline: Number(data.deadline ?? 0),
    "milestone-count": Number(data["milestone-count"] ?? 0),
    "milestones-completed": Number(data["milestones-completed"] ?? 0),
    finalized: Boolean(data.finalized),
    "created-at": Number(data["created-at"] ?? 0),
  };
}

export interface ContractMilestone {
  description: string;
  percentage: number;
  completed: boolean;
  released: boolean;
}

export async function getMilestone(
  campaignId: number,
  milestoneId: number
): Promise<ContractMilestone | null> {
  const result = await callReadOnly("get-milestone", [
    Cl.uint(campaignId),
    Cl.uint(milestoneId),
  ]);
  const val = cvToValue(result, true);
  if (!val || typeof val !== "object") return null;
  const data = "value" in val && typeof val.value === "object" && val.value !== null
    ? (val.value as Record<string, unknown>)
    : (val as Record<string, unknown>);
  return {
    description: String(data.description ?? ""),
    percentage: Number(data.percentage ?? 0),
    completed: Boolean(data.completed),
    released: Boolean(data.released),
  };
}

export async function getContribution(
  campaignId: number,
  backer: string
): Promise<{ amount: number; refunded: boolean } | null> {
  const result = await callReadOnly("get-contribution", [
    Cl.uint(campaignId),
    Cl.standardPrincipal(backer),
  ]);
  const val = cvToValue(result, true);
  if (!val || typeof val !== "object") return null;
  const data = "value" in val && typeof val.value === "object" && val.value !== null
    ? (val.value as Record<string, unknown>)
    : (val as Record<string, unknown>);
  return {
    amount: Number(data.amount ?? 0),
    refunded: Boolean(data.refunded),
  };
}

export async function isCampaignActive(campaignId: number): Promise<boolean> {
  const result = await callReadOnly("is-campaign-active", [
    Cl.uint(campaignId),
  ]);
  return cvToValue(result) as boolean;
}

export async function canClaimRefund(
  campaignId: number,
  backer: string
): Promise<boolean> {
  const result = await callReadOnly("can-claim-refund", [
    Cl.uint(campaignId),
    Cl.standardPrincipal(backer),
  ]);
  return cvToValue(result) as boolean;
}

export async function getContractBalance(): Promise<number> {
  const result = await callReadOnly("get-contract-stx-balance");
  return Number(cvToValue(result, true));
}

// ── Fetch all campaigns with milestones ─────────────────────────────────────

export interface FullCampaign {
  id: number;
  creator: string;
  title: string;
  goal: number; // uSTX
  raised: number; // uSTX
  deadline: number;
  milestoneCount: number;
  milestonesCompleted: number;
  finalized: boolean;
  createdAt: number;
  milestones: ContractMilestone[];
}

export async function fetchAllCampaigns(): Promise<FullCampaign[]> {
  const total = await getTotalCampaigns();
  if (total === 0) return [];

  const campaigns: FullCampaign[] = [];

  for (let i = 1; i <= total; i++) {
    const raw = await getCampaign(i);
    if (!raw) continue;

    const milestones: ContractMilestone[] = [];
    for (let m = 0; m < raw["milestone-count"]; m++) {
      const ms = await getMilestone(i, m);
      if (ms) milestones.push(ms);
    }

    campaigns.push({
      id: i,
      creator: raw.creator,
      title: raw.title,
      goal: raw.goal,
      raised: raw.raised,
      deadline: raw.deadline,
      milestoneCount: raw["milestone-count"],
      milestonesCompleted: raw["milestones-completed"],
      finalized: raw.finalized,
      createdAt: raw["created-at"],
      milestones,
    });
  }

  return campaigns;
}

export async function fetchCampaignById(
  id: number
): Promise<FullCampaign | null> {
  const raw = await getCampaign(id);
  if (!raw) return null;

  const milestones: ContractMilestone[] = [];
  for (let m = 0; m < raw["milestone-count"]; m++) {
    const ms = await getMilestone(id, m);
    if (ms) milestones.push(ms);
  }

  return {
    id,
    creator: raw.creator,
    title: raw.title,
    goal: raw.goal,
    raised: raw.raised,
    deadline: raw.deadline,
    milestoneCount: raw["milestone-count"],
    milestonesCompleted: raw["milestones-completed"],
    finalized: raw.finalized,
    createdAt: raw["created-at"],
    milestones,
  };
}

// ── STX balance fetch ───────────────────────────────────────────────────────
export async function fetchStxBalance(address: string): Promise<number> {
  const res = await fetch(
    `${STACKS_API_BASE}/extended/v1/address/${address}/balances`
  );
  if (!res.ok) return 0;
  const data = await res.json();
  return Number(data.stx?.balance ?? 0);
}

// ── Transaction monitoring ──────────────────────────────────────────────────
export async function waitForTransaction(
  txId: string,
  maxAttempts = 60,
  interval = 10000
): Promise<{ success: boolean; result?: string }> {
  const cleanId = txId.startsWith("0x") ? txId : `0x${txId}`;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const res = await fetch(
      `${STACKS_API_BASE}/extended/v1/tx/${cleanId}`
    );
    if (res.ok) {
      const tx = await res.json();
      if (tx.tx_status === "success") {
        return { success: true, result: tx.tx_result?.repr };
      }
      if (
        tx.tx_status === "abort_by_response" ||
        tx.tx_status === "abort_by_post_condition"
      ) {
        return { success: false, result: tx.tx_result?.repr };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }

  return { success: false, result: "Transaction confirmation timeout" };
}

// ── Block height info ───────────────────────────────────────────────────────
export async function getCurrentBlockHeight(): Promise<number> {
  const res = await fetch(`${STACKS_API_BASE}/v2/info`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.burn_block_height ?? 0;
}
