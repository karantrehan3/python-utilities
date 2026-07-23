export type LoremType = 'words' | 'sentences' | 'paragraphs';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
  'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord(): string {
  return LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)];
}

function capitalise(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function makeSentence(): string {
  const wordCount = randomInt(8, 15);
  const words = Array.from({ length: wordCount }, randomWord);
  return `${capitalise(words.join(' '))}.`;
}

export function generateUuids(count: number): string {
  return Array.from({ length: count }, () => crypto.randomUUID()).join('\n');
}

export function generateLorem(loremType: LoremType, count: number): string {
  if (loremType === 'words') {
    return capitalise(Array.from({ length: count }, randomWord).join(' '));
  }
  if (loremType === 'sentences') {
    return Array.from({ length: count }, makeSentence).join(' ');
  }
  return Array.from({ length: count }, () =>
    Array.from({ length: randomInt(3, 6) }, makeSentence).join(' '),
  ).join('\n\n');
}
