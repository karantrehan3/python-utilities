export interface DiffResult {
  diff: string;
  additions: number;
  deletions: number;
}

/**
 * Compute a line-by-line diff between two texts, returning a prefixed diff
 * string (`+`/`-`/space) plus addition/deletion counts. The `diff` library is
 * dynamically imported to keep it off the initial bundle.
 */
export async function diffText(text1: string, text2: string): Promise<DiffResult> {
  const { diffLines } = await import('diff');
  const parts = diffLines(text1, text2);

  let additions = 0;
  let deletions = 0;
  const lines: string[] = [];

  for (const part of parts) {
    // Split into lines, dropping the trailing empty element from a final newline.
    const segment = part.value.split('\n');
    if (segment.length > 0 && segment[segment.length - 1] === '') segment.pop();

    const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
    if (part.added) additions += segment.length;
    if (part.removed) deletions += segment.length;

    for (const line of segment) {
      lines.push(`${prefix}${line}`);
    }
  }

  return { diff: lines.join('\n'), additions, deletions };
}
