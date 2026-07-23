export interface RegexMatch {
  match: string;
  start: number;
  end: number;
  groups: Record<string, string>;
}

export interface RegexResult {
  matches: RegexMatch[];
  count: number;
}

/**
 * Test a JavaScript regular expression against text and return all matches.
 * Uses the native RegExp engine (browser-side), so patterns follow JS syntax.
 * Throws on an invalid pattern/flags — callers should surface the message.
 */
export function testRegex(text: string, pattern: string, flags: string): RegexResult {
  const normalisedFlags = flags.includes('g') ? flags : `${flags}g`;
  const regex = new RegExp(pattern, normalisedFlags);

  const matches: RegexMatch[] = [];
  for (const match of text.matchAll(regex)) {
    const start = match.index ?? 0;
    matches.push({
      match: match[0],
      start,
      end: start + match[0].length,
      groups: match.groups ? { ...match.groups } : {},
    });
  }

  return { matches, count: matches.length };
}
