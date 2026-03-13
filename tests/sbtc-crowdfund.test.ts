
import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const CONTRACT_NAME = "sbtc-crowdfund";

describe("sBTC Crowdfund - Campaign Creation", () => {
  it("creates a campaign successfully", () => {
    const deadline = simnet.blockHeight + 200;
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Test Campaign"),
        Cl.uint(10000000), // 10 STX goal
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1"), Cl.stringAscii("Milestone 2")]),
        Cl.list([Cl.uint(50), Cl.uint(50)]),
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("fails with goal below minimum", () => {
    const deadline = simnet.blockHeight + 200;
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Low Goal Campaign"),
        Cl.uint(100), // Below 1 STX minimum
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(1010)); // ERR_INVALID_AMOUNT
  });

  it("fails with deadline too soon", () => {
    const deadline = simnet.blockHeight + 10; // Less than MIN_DURATION
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Short Deadline"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(1013)); // ERR_INVALID_DEADLINE
  });

  it("fails when milestone percentages don't sum to 100", () => {
    const deadline = simnet.blockHeight + 200;
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Bad Milestones"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1"), Cl.stringAscii("Milestone 2")]),
        Cl.list([Cl.uint(30), Cl.uint(50)]), // Only 80%
      ],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(1014)); // ERR_INVALID_MILESTONES
  });
});

describe("sBTC Crowdfund - Contributions", () => {
  it("accepts contributions to active campaign", () => {
    const deadline = simnet.blockHeight + 200;
    
    // Create campaign
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Funded Campaign"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Build MVP")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Contribute
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "contribute",
      [Cl.uint(1), Cl.uint(5000000)], // 5 STX
      wallet2
    );
    expect(result).toBeOk(Cl.bool(true));

    // Check contribution recorded
    const contribution = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-contribution",
      [Cl.uint(1), Cl.principal(wallet2)],
      deployer
    );
    expect(contribution.result).toBeSome(
      Cl.tuple({
        amount: Cl.uint(5000000),
        refunded: Cl.bool(false),
      })
    );
  });

  it("fails to contribute to non-existent campaign", () => {
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "contribute",
      [Cl.uint(999), Cl.uint(1000000)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(1002)); // ERR_CAMPAIGN_NOT_FOUND
  });

  it("fails to contribute zero amount", () => {
    const deadline = simnet.blockHeight + 200;
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Zero Test"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "contribute",
      [Cl.uint(1), Cl.uint(0)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(1010)); // ERR_INVALID_AMOUNT
  });
});

describe("sBTC Crowdfund - Milestone Completion", () => {
  it("allows creator to complete milestone when goal reached", () => {
    const deadline = simnet.blockHeight + 200;
    
    // Create campaign
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Successful Campaign"),
        Cl.uint(10000000), // 10 STX goal
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Phase 1"), Cl.stringAscii("Phase 2")]),
        Cl.list([Cl.uint(60), Cl.uint(40)]),
      ],
      wallet1
    );

    // Fund to goal
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    // Complete first milestone
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "complete-milestone",
      [Cl.uint(1), Cl.uint(0)], // Campaign 1, Milestone 0
      wallet1
    );
    expect(result).toBeOk(Cl.uint(6000000)); // 60% of 10 STX
  });

  it("fails when non-creator tries to complete milestone", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Auth Test"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "complete-milestone",
      [Cl.uint(1), Cl.uint(0)],
      wallet2 // Not the creator
    );
    expect(result).toBeErr(Cl.uint(1001)); // ERR_NOT_AUTHORIZED
  });

  it("fails when goal not reached", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Underfunded"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Only partial funding
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], wallet2);

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "complete-milestone",
      [Cl.uint(1), Cl.uint(0)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(1005)); // ERR_GOAL_NOT_REACHED
  });
});

describe("sBTC Crowdfund - Refunds", () => {
  it("allows refund when campaign fails", () => {
    const deadline = simnet.blockHeight + 150;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Failed Campaign"),
        Cl.uint(100000000), // 100 STX goal (won't be reached)
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Partial contribution
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    // Advance past deadline
    simnet.mineEmptyBlocks(160);

    // Claim refund
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "claim-refund",
      [Cl.uint(1)],
      wallet2
    );
    expect(result).toBeOk(Cl.uint(10000000));
  });

  it("fails refund when campaign not ended", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Active Campaign"),
        Cl.uint(100000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "claim-refund",
      [Cl.uint(1)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(1004)); // ERR_CAMPAIGN_NOT_ENDED
  });

  it("fails refund when goal was reached", () => {
    const deadline = simnet.blockHeight + 150;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Success No Refund"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    simnet.mineEmptyBlocks(160);

    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "claim-refund",
      [Cl.uint(1)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(1006)); // ERR_GOAL_REACHED
  });
});

describe("sBTC Crowdfund - Read-only Functions", () => {
  it("returns campaign details", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Readable Campaign"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    const { result } = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-campaign",
      [Cl.uint(1)],
      deployer
    );
    
    // Verify result is Some (not None)
    expect(result.type).toBe("some");
  });

  it("calculates campaign progress correctly", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Progress Test"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], wallet2);

    const { result } = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-progress",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(Cl.uint(50)); // 50% progress
  });

  it("returns total campaigns count", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Campaign A"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone 1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Campaign B"),
        Cl.uint(20000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1"), Cl.stringAscii("M2")]),
        Cl.list([Cl.uint(50), Cl.uint(50)]),
      ],
      wallet2
    );

    const { result } = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-total-campaigns",
      [],
      deployer
    );
    expect(result).toBeUint(2);
  });
});

// ============================================================================
// MULTI-USER CONTRIBUTION TESTS
// ============================================================================
describe("sBTC Crowdfund - Multi-User Contributions", () => {
  it("allows multiple users to contribute to same campaign", () => {
    const deadline = simnet.blockHeight + 200;
    
    // Create campaign
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Multi-Backer Campaign"),
        Cl.uint(30000000), // 30 STX goal
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("MVP"), Cl.stringAscii("Launch")]),
        Cl.list([Cl.uint(60), Cl.uint(40)]),
      ],
      wallet1
    );

    // Multiple users contribute
    const result1 = simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);
    const result2 = simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(15000000)], wallet3);
    const result3 = simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], deployer);

    expect(result1.result).toBeOk(Cl.bool(true));
    expect(result2.result).toBeOk(Cl.bool(true));
    expect(result3.result).toBeOk(Cl.bool(true));

    // Check campaign raised amount
    const campaign = simnet.callReadOnlyFn(CONTRACT_NAME, "get-campaign", [Cl.uint(1)], deployer);
    const campaignData = campaign.result;
    expect(campaignData.type).toBe("some");
    
    // Check each contribution
    const contrib2 = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contribution", [Cl.uint(1), Cl.principal(wallet2)], deployer);
    const contrib3 = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contribution", [Cl.uint(1), Cl.principal(wallet3)], deployer);
    
    expect(contrib2.result).toBeSome(Cl.tuple({ amount: Cl.uint(10000000), refunded: Cl.bool(false) }));
    expect(contrib3.result).toBeSome(Cl.tuple({ amount: Cl.uint(15000000), refunded: Cl.bool(false) }));
  });

  it("allows same user to contribute multiple times", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Repeat Contributor"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Single Milestone")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Same user contributes multiple times
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(2000000)], wallet2);
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(3000000)], wallet2);
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], wallet2);

    // Total should be cumulative
    const contribution = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-contribution",
      [Cl.uint(1), Cl.principal(wallet2)],
      deployer
    );
    expect(contribution.result).toBeSome(Cl.tuple({ amount: Cl.uint(10000000), refunded: Cl.bool(false) }));
  });
});

// ============================================================================
// SEQUENTIAL MILESTONE COMPLETION TESTS
// ============================================================================
describe("sBTC Crowdfund - Sequential Milestone Completion", () => {
  it("completes milestones in order and finalizes campaign", () => {
    const deadline = simnet.blockHeight + 200;
    
    // Create campaign with 3 milestones
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Three Phase Project"),
        Cl.uint(30000000), // 30 STX
        Cl.uint(deadline),
        Cl.list([
          Cl.stringAscii("Phase 1: Design"),
          Cl.stringAscii("Phase 2: Build"),
          Cl.stringAscii("Phase 3: Launch"),
        ]),
        Cl.list([Cl.uint(30), Cl.uint(40), Cl.uint(30)]),
      ],
      wallet1
    );

    // Fund the campaign
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(30000000)], wallet2);

    // Complete milestone 0
    const result0 = simnet.callPublicFn(CONTRACT_NAME, "complete-milestone", [Cl.uint(1), Cl.uint(0)], wallet1);
    expect(result0.result).toBeOk(Cl.uint(9000000)); // 30% of 30 STX = 9 STX

    // Complete milestone 1
    const result1 = simnet.callPublicFn(CONTRACT_NAME, "complete-milestone", [Cl.uint(1), Cl.uint(1)], wallet1);
    expect(result1.result).toBeOk(Cl.uint(12000000)); // 40% of 30 STX = 12 STX

    // Complete milestone 2 (final)
    const result2 = simnet.callPublicFn(CONTRACT_NAME, "complete-milestone", [Cl.uint(1), Cl.uint(2)], wallet1);
    expect(result2.result).toBeOk(Cl.uint(9000000)); // 30% of 30 STX = 9 STX

    // Verify campaign is finalized
    const campaign = simnet.callReadOnlyFn(CONTRACT_NAME, "get-campaign", [Cl.uint(1)], deployer);
    expect(campaign.result.type).toBe("some");
    
    // Verify campaign is no longer active
    const isActive = simnet.callReadOnlyFn(CONTRACT_NAME, "is-campaign-active", [Cl.uint(1)], deployer);
    expect(isActive.result).toBeBool(false);
  });

  it("fails to complete milestone out of order", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Order Test"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("First"), Cl.stringAscii("Second")]),
        Cl.list([Cl.uint(50), Cl.uint(50)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    // Try to complete milestone 1 before milestone 0
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "complete-milestone",
      [Cl.uint(1), Cl.uint(1)], // Trying milestone 1 first
      wallet1
    );
    expect(result).toBeErr(Cl.uint(1007)); // ERR_MILESTONE_INVALID
  });

  it("fails to complete same milestone twice", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Double Complete Test"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Only Milestone")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    // Complete milestone 0
    simnet.callPublicFn(CONTRACT_NAME, "complete-milestone", [Cl.uint(1), Cl.uint(0)], wallet1);

    // Try to complete milestone 0 again
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "complete-milestone",
      [Cl.uint(1), Cl.uint(0)],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(1008)); // ERR_ALREADY_CLAIMED
  });
});

// ============================================================================
// DOUBLE REFUND PREVENTION TESTS
// ============================================================================
describe("sBTC Crowdfund - Double Refund Prevention", () => {
  it("prevents claiming refund twice", () => {
    const deadline = simnet.blockHeight + 150;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Double Refund Test"),
        Cl.uint(100000000), // 100 STX goal (won't reach)
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Never Reached")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);
    simnet.mineEmptyBlocks(160);

    // First refund succeeds
    const result1 = simnet.callPublicFn(CONTRACT_NAME, "claim-refund", [Cl.uint(1)], wallet2);
    expect(result1.result).toBeOk(Cl.uint(10000000));

    // Second refund fails
    const result2 = simnet.callPublicFn(CONTRACT_NAME, "claim-refund", [Cl.uint(1)], wallet2);
    expect(result2.result).toBeErr(Cl.uint(1008)); // ERR_ALREADY_CLAIMED
  });

  it("fails refund for non-contributor", () => {
    const deadline = simnet.blockHeight + 150;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Non-Contributor Refund"),
        Cl.uint(100000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Milestone")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);
    simnet.mineEmptyBlocks(160);

    // wallet3 never contributed, tries to claim refund
    const { result } = simnet.callPublicFn(CONTRACT_NAME, "claim-refund", [Cl.uint(1)], wallet3);
    expect(result).toBeErr(Cl.uint(1009)); // ERR_NO_CONTRIBUTION
  });
});

// ============================================================================
// CAMPAIGN STATE VALIDATION TESTS
// ============================================================================
describe("sBTC Crowdfund - Campaign State Validation", () => {
  it("fails to contribute to expired campaign", () => {
    const deadline = simnet.blockHeight + 150;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Expired Campaign"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Advance past deadline
    simnet.mineEmptyBlocks(160);

    // Try to contribute after deadline
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "contribute",
      [Cl.uint(1), Cl.uint(5000000)],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(1003)); // ERR_CAMPAIGN_ENDED
  });

  it("fails to contribute to finalized campaign", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Finalized Campaign"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("Only Milestone")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);
    simnet.callPublicFn(CONTRACT_NAME, "complete-milestone", [Cl.uint(1), Cl.uint(0)], wallet1);

    // Campaign is now finalized, try to contribute
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "contribute",
      [Cl.uint(1), Cl.uint(5000000)],
      wallet3
    );
    expect(result).toBeErr(Cl.uint(1011)); // ERR_CAMPAIGN_FINALIZED
  });
});

// ============================================================================
// COMPREHENSIVE READ-ONLY FUNCTION TESTS
// ============================================================================
describe("sBTC Crowdfund - Comprehensive Read Functions", () => {
  it("get-milestone returns correct milestone data", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Milestone Read Test"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("First Phase"), Cl.stringAscii("Second Phase")]),
        Cl.list([Cl.uint(60), Cl.uint(40)]),
      ],
      wallet1
    );

    const milestone0 = simnet.callReadOnlyFn(CONTRACT_NAME, "get-milestone", [Cl.uint(1), Cl.uint(0)], deployer);
    const milestone1 = simnet.callReadOnlyFn(CONTRACT_NAME, "get-milestone", [Cl.uint(1), Cl.uint(1)], deployer);

    expect(milestone0.result).toBeSome(Cl.tuple({
      description: Cl.stringAscii("First Phase"),
      percentage: Cl.uint(60),
      completed: Cl.bool(false),
      released: Cl.bool(false),
    }));

    expect(milestone1.result).toBeSome(Cl.tuple({
      description: Cl.stringAscii("Second Phase"),
      percentage: Cl.uint(40),
      completed: Cl.bool(false),
      released: Cl.bool(false),
    }));
  });

  it("is-campaign-active returns correct status", () => {
    const deadline = simnet.blockHeight + 150;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Active Check"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Should be active initially
    let isActive = simnet.callReadOnlyFn(CONTRACT_NAME, "is-campaign-active", [Cl.uint(1)], deployer);
    expect(isActive.result).toBeBool(true);

    // Advance past deadline
    simnet.mineEmptyBlocks(160);

    // Should no longer be active
    isActive = simnet.callReadOnlyFn(CONTRACT_NAME, "is-campaign-active", [Cl.uint(1)], deployer);
    expect(isActive.result).toBeBool(false);
  });

  it("is-campaign-successful returns correct status", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Success Check"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Not successful initially
    let isSuccessful = simnet.callReadOnlyFn(CONTRACT_NAME, "is-campaign-successful", [Cl.uint(1)], deployer);
    expect(isSuccessful.result).toBeBool(false);

    // Partial funding - still not successful
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], wallet2);
    isSuccessful = simnet.callReadOnlyFn(CONTRACT_NAME, "is-campaign-successful", [Cl.uint(1)], deployer);
    expect(isSuccessful.result).toBeBool(false);

    // Full funding - now successful
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], wallet3);
    isSuccessful = simnet.callReadOnlyFn(CONTRACT_NAME, "is-campaign-successful", [Cl.uint(1)], deployer);
    expect(isSuccessful.result).toBeBool(true);
  });

  it("can-claim-refund returns correct eligibility", () => {
    const deadline = simnet.blockHeight + 150;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Refund Eligibility"),
        Cl.uint(100000000), // High goal won't be reached
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    // Cannot refund before deadline
    let canRefund = simnet.callReadOnlyFn(CONTRACT_NAME, "can-claim-refund", [Cl.uint(1), Cl.principal(wallet2)], deployer);
    expect(canRefund.result).toBeBool(false);

    // Advance past deadline
    simnet.mineEmptyBlocks(160);

    // Can now refund
    canRefund = simnet.callReadOnlyFn(CONTRACT_NAME, "can-claim-refund", [Cl.uint(1), Cl.principal(wallet2)], deployer);
    expect(canRefund.result).toBeBool(true);

    // Non-contributor cannot refund
    canRefund = simnet.callReadOnlyFn(CONTRACT_NAME, "can-claim-refund", [Cl.uint(1), Cl.principal(wallet3)], deployer);
    expect(canRefund.result).toBeBool(false);
  });

  it("get-contract-stx-balance reflects contributions", () => {
    const deadline = simnet.blockHeight + 200;
    
    // Initial balance should be 0
    let balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-stx-balance", [], deployer);
    expect(balance.result).toBeUint(0);

    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Balance Test"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], wallet2);
    
    balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-stx-balance", [], deployer);
    expect(balance.result).toBeUint(5000000);

    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(5000000)], wallet3);
    
    balance = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-stx-balance", [], deployer);
    expect(balance.result).toBeUint(10000000);
  });

  it("get-contract-principal returns correct address", () => {
    const { result } = simnet.callReadOnlyFn(CONTRACT_NAME, "get-contract-principal", [], deployer);
    // Contract principals have type "contract" not "principal"
    expect(result.type).toBe("contract");
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================
describe("sBTC Crowdfund - Edge Cases", () => {
  it("handles exact goal amount contribution", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Exact Goal"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Contribute exactly the goal amount
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(10000000)], wallet2);

    const isSuccessful = simnet.callReadOnlyFn(CONTRACT_NAME, "is-campaign-successful", [Cl.uint(1)], deployer);
    expect(isSuccessful.result).toBeBool(true);

    const progress = simnet.callReadOnlyFn(CONTRACT_NAME, "get-progress", [Cl.uint(1)], deployer);
    expect(progress.result).toBeOk(Cl.uint(100));
  });

  it("handles overfunded campaign", () => {
    const deadline = simnet.blockHeight + 200;
    
    simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Overfunded"),
        Cl.uint(10000000), // 10 STX goal
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );

    // Contribute more than goal
    simnet.callPublicFn(CONTRACT_NAME, "contribute", [Cl.uint(1), Cl.uint(20000000)], wallet2);

    const campaign = simnet.callReadOnlyFn(CONTRACT_NAME, "get-campaign", [Cl.uint(1)], deployer);
    expect(campaign.result.type).toBe("some");

    const progress = simnet.callReadOnlyFn(CONTRACT_NAME, "get-progress", [Cl.uint(1)], deployer);
    expect(progress.result).toBeOk(Cl.uint(200)); // 200% funded
  });

  it("handles campaign with maximum milestones", () => {
    const deadline = simnet.blockHeight + 200;
    
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Max Milestones"),
        Cl.uint(10000000),
        Cl.uint(deadline),
        Cl.list([
          Cl.stringAscii("M1"), Cl.stringAscii("M2"), Cl.stringAscii("M3"),
          Cl.stringAscii("M4"), Cl.stringAscii("M5"), Cl.stringAscii("M6"),
          Cl.stringAscii("M7"), Cl.stringAscii("M8"), Cl.stringAscii("M9"),
          Cl.stringAscii("M10"),
        ]),
        Cl.list([
          Cl.uint(10), Cl.uint(10), Cl.uint(10),
          Cl.uint(10), Cl.uint(10), Cl.uint(10),
          Cl.uint(10), Cl.uint(10), Cl.uint(10),
          Cl.uint(10),
        ]),
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("handles minimum goal amount", () => {
    const deadline = simnet.blockHeight + 200;
    
    const { result } = simnet.callPublicFn(
      CONTRACT_NAME,
      "create-campaign",
      [
        Cl.stringAscii("Min Goal"),
        Cl.uint(1000000), // 1 STX - minimum
        Cl.uint(deadline),
        Cl.list([Cl.stringAscii("M1")]),
        Cl.list([Cl.uint(100)]),
      ],
      wallet1
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it("get-progress returns error for non-existent campaign", () => {
    const { result } = simnet.callReadOnlyFn(
      CONTRACT_NAME,
      "get-progress",
      [Cl.uint(9999)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(1002)); // ERR_CAMPAIGN_NOT_FOUND
  });
});
