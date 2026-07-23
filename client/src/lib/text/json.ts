export interface JsonResult {
  valid: boolean;
  result: string;
  error: string | null;
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The input is not valid JSON.';
}

export function formatJson(text: string, indent: number, sortKeys: boolean): JsonResult {
  try {
    const parsed = JSON.parse(text);
    const value = sortKeys ? sortDeep(parsed) : parsed;
    return { valid: true, result: JSON.stringify(value, null, indent), error: null };
  } catch (error: unknown) {
    return { valid: false, result: '', error: errorMessage(error) };
  }
}

export function minifyJson(text: string): JsonResult {
  try {
    return { valid: true, result: JSON.stringify(JSON.parse(text)), error: null };
  } catch (error: unknown) {
    return { valid: false, result: '', error: errorMessage(error) };
  }
}
