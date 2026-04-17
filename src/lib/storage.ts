import { get, set } from "idb-keyval";
import type { ChatMessage, UserProfile } from "./types";

const KEY_MESSAGES = "rail-saathi:messages";
const KEY_PROFILE = "rail-saathi:profile";

export async function loadMessages(): Promise<ChatMessage[]> {
  try {
    return (await get<ChatMessage[]>(KEY_MESSAGES)) ?? [];
  } catch {
    return [];
  }
}

export async function saveMessages(messages: ChatMessage[]): Promise<void> {
  // Strip transient pending messages before persisting.
  const clean = messages.filter((m) => !m.pending);
  try {
    await set(KEY_MESSAGES, clean);
  } catch {
    /* ignore */
  }
}

export async function loadProfile(): Promise<UserProfile> {
  try {
    return (
      (await get<UserProfile>(KEY_PROFILE)) ?? {
        pnrs: [],
        frequentRoutes: [],
        language: "en",
      }
    );
  } catch {
    return { pnrs: [], frequentRoutes: [], language: "en" };
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    await set(KEY_PROFILE, profile);
  } catch {
    /* ignore */
  }
}
