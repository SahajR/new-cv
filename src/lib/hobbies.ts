import { getCollection, type CollectionEntry } from 'astro:content';
import photographs from '../data/hobby-photos.json';

export interface HobbyPhoto { src: string; thumbnail: string; width: number; height: number; alt: string }
export type Hobby = CollectionEntry<'hobbies'>;
export const hobbyHref = (hobby: Hobby) => `/hobbies/${hobby.id}/`;
export async function getHobbies() {
  return (await getCollection('hobbies')).sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}
export function hobbyPhotos(hobby: Hobby): HobbyPhoto[] {
  const album = (photographs as Record<string, HobbyPhoto[]>)[hobby.data.album];
  if (!album?.length) throw new Error(`Missing hobby album: ${hobby.data.album}`);
  return album;
}
