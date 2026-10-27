import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'projects'>;

export async function getPublishedEntries(): Promise<Entry[]> {
  return (await getCollection('projects'))
    .filter((p) => !p.data.draft)
    .sort(
      (a, b) =>
        new Date(b.data.date ?? 0).getTime() -
        new Date(a.data.date ?? 0).getTime()
    );
}

// Entries with only frontmatter (e.g. a project that just links out) get no article page
export function hasWriteup(entry: Entry): boolean {
  return Boolean(entry.body?.trim());
}

// Projects are called by their short name: vault.miszori.dev → vault
export function shortName(entry: Entry): string {
  return entry.data.title.replace(/\.miszori\.dev$/, '');
}
