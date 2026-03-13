import { describe, it, expect } from "vitest";
import { getProgressColor, STX_USD_RATE } from "@/lib/utils";
import { truncateAddress, formatSTX, getDaysLeft, getProgressPercentage } from "@/data/mockData";

describe("getProgressColor", () => {
  it("returns success gradient for 100%+", () => {
    expect(getProgressColor(100)).toBe("gradient-progress-success");
    expect(getProgressColor(150)).toBe("gradient-progress-success");
  });

  it("returns high gradient for 67-99%", () => {
    expect(getProgressColor(67)).toBe("gradient-progress-high");
    expect(getProgressColor(99)).toBe("gradient-progress-high");
  });

  it("returns mid gradient for 34-66%", () => {
    expect(getProgressColor(34)).toBe("gradient-progress-mid");
    expect(getProgressColor(66)).toBe("gradient-progress-mid");
  });

  it("returns orange gradient for 0-33%", () => {
    expect(getProgressColor(0)).toBe("gradient-orange");
    expect(getProgressColor(33)).toBe("gradient-orange");
  });
});

describe("truncateAddress", () => {
  it("truncates long addresses", () => {
    const addr = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
    expect(truncateAddress(addr)).toBe("SP2J6Z...9EJ7");
  });

  it("returns short addresses as-is", () => {
    expect(truncateAddress("short")).toBe("short");
  });
});

describe("formatSTX", () => {
  it("formats numbers with commas", () => {
    expect(formatSTX(50000)).toBe("50,000");
    expect(formatSTX(1000000)).toBe("1,000,000");
  });

  it("handles zero", () => {
    expect(formatSTX(0)).toBe("0");
  });
});

describe("getDaysLeft", () => {
  it("returns 0 for past dates", () => {
    const past = new Date("2020-01-01");
    expect(getDaysLeft(past)).toBe(0);
  });

  it("returns positive for future dates", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(getDaysLeft(future)).toBeGreaterThanOrEqual(9);
    expect(getDaysLeft(future)).toBeLessThanOrEqual(11);
  });
});

describe("getProgressPercentage", () => {
  it("calculates correct percentage", () => {
    expect(getProgressPercentage(50, 100)).toBe(50);
    expect(getProgressPercentage(100, 100)).toBe(100);
  });

  it("caps at 100%", () => {
    expect(getProgressPercentage(200, 100)).toBe(100);
  });

  it("rounds to nearest integer", () => {
    expect(getProgressPercentage(33, 100)).toBe(33);
  });
});

describe("STX_USD_RATE", () => {
  it("is a positive number", () => {
    expect(STX_USD_RATE).toBeGreaterThan(0);
  });
});
