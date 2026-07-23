import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({ default: {} }));

import { effectProfileForChoice } from "./JarMemoryEffect";

describe("JarMemoryEffect", () => {
  it("maps aroma to warm amber breath", () => {
    expect(effectProfileForChoice("aroma")).toEqual({
      tint: 0xd4b46a,
      particleCount: 22,
      audioFilter: "warm-lowpass",
      motif: "温情"
    });
  });

  it("maps hongqu red to the densest craft particles", () => {
    expect(effectProfileForChoice("hongqu_red")).toEqual({
      tint: 0xa83b32,
      particleCount: 36,
      audioFilter: "pulse-bandpass",
      motif: "工艺"
    });
  });

  it("maps cold clay to a sparse distant edge", () => {
    expect(effectProfileForChoice("cold_clay")).toEqual({
      tint: 0xb7c2c0,
      particleCount: 14,
      audioFilter: "distant-lowpass",
      motif: "时间"
    });
  });
});
