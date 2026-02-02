import { describe, expect, it } from "bun:test";
import { fuzzyMatch, sortByFuzzyScore } from "../src/utils/fuzzy-match.ts";

describe("fuzzyMatch", () => {
  it("matches empty query", () => {
    const result = fuzzyMatch("", "target");
    expect(result.matches).toBe(true);
    expect(result.indices).toEqual([]);
  });

  it("scores consecutive matches higher than gaps", () => {
    const consecutive = fuzzyMatch("ab", "ab");
    const gapped = fuzzyMatch("ab", "a b");

    expect(consecutive.matches).toBe(true);
    expect(gapped.matches).toBe(true);
    expect(consecutive.score).toBeGreaterThan(gapped.score);
  });

  it("sorts by fuzzy score descending", () => {
    const items = ["alpha", "alpine", "beta"];
    const sorted = sortByFuzzyScore(items, "alp", (item) => item);

    expect(sorted).toHaveLength(2);
    expect(sorted[0]?.item).toBe("alpha");
    expect(sorted[1]?.item).toBe("alpine");
  });
});
