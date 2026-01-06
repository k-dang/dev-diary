export interface FuzzyMatchResult {
  matches: boolean;
  score: number;
  indices: number[];
}

export function fuzzyMatch(query: string, target: string): FuzzyMatchResult {
  if (!query) {
    return { matches: true, score: 0, indices: [] };
  }

  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  const indices: number[] = [];
  let queryIndex = 0;
  let score = 0;
  let lastMatchIndex = -1;

  for (
    let i = 0;
    i < targetLower.length && queryIndex < queryLower.length;
    i++
  ) {
    if (targetLower[i] === queryLower[queryIndex]) {
      indices.push(i);

      // Bonus for consecutive matches
      if (lastMatchIndex === i - 1) {
        score += 2;
      } else {
        score += 1;
      }

      // Bonus for matching at word boundaries
      if (
        i === 0 ||
        target[i - 1] === "/" ||
        target[i - 1] === "-" ||
        target[i - 1] === "_"
      ) {
        score += 3;
      }

      lastMatchIndex = i;
      queryIndex++;
    }
  }

  const matches = queryIndex === queryLower.length;

  // Bonus for shorter targets (more relevant matches)
  if (matches) {
    score += Math.max(0, 50 - target.length);
  }

  return { matches, score, indices };
}

export function sortByFuzzyScore<T>(
  items: T[],
  query: string,
  getTarget: (item: T) => string,
): { item: T; result: FuzzyMatchResult }[] {
  return items
    .map((item) => ({
      item,
      result: fuzzyMatch(query, getTarget(item)),
    }))
    .filter(({ result }) => result.matches)
    .sort((a, b) => b.result.score - a.result.score);
}
