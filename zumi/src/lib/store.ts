import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { nowIso, uid } from './id';
import type { Broadcast, Client, Creation, Digest, Item, Material, Profile } from './types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: string;
}

interface State {
  onboarded: boolean;
  profile: Profile;
  items: Item[];
  clients: Client[];
  broadcasts: Broadcast[];
  chat: ChatMessage[];
  digests: Digest[];
  materials: Material[];
  creations: Creation[];
  isPro: boolean;
  /** voice commands used this calendar month (free tier limit) */
  usage: { month: string; count: number };

  setOnboarded: (v: boolean) => void;
  setProfile: (p: Partial<Profile>) => void;
  setPro: (v: boolean) => void;
  bumpUsage: () => void;

  addItem: (i: Omit<Item, 'id' | 'createdAt'>) => Item;
  updateItem: (id: string, patch: Partial<Item>) => void;
  removeItem: (id: string) => void;

  upsertClient: (c: Partial<Client> & { name: string }) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  removeClient: (id: string) => void;

  addBroadcast: (b: Omit<Broadcast, 'id' | 'createdAt' | 'sentIds'>) => Broadcast;
  markBroadcastSent: (id: string, clientId: string) => void;
  updateBroadcast: (id: string, patch: Partial<Broadcast>) => void;

  addDigest: (d: Omit<Digest, 'id' | 'createdAt'>) => Digest;
  updateDigest: (id: string, patch: Partial<Digest>) => void;
  removeDigest: (id: string) => void;

  addMaterial: (m: Omit<Material, 'id' | 'createdAt'>) => Material;
  removeMaterial: (id: string) => void;
  addCreation: (c: Omit<Creation, 'id' | 'createdAt'>) => Creation;
  updateCreation: (id: string, patch: Partial<Creation>) => void;
  removeCreation: (id: string) => void;

  pushChat: (role: ChatMessage['role'], text: string) => void;
  clearChat: () => void;
}

const monthKey = () => new Date().toISOString().slice(0, 7);

export const FREE_MONTHLY_COMMANDS = 30;

const normalize = (s: string) => s.trim().toLowerCase().replace(/ё/g, 'е');

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: {
        name: '',
        role: 'broker',
        remindBeforeMin: 60,
        voiceReplies: true,
        whatsappReminders: true,
        calendarSync: true,
        handsFree: false,
      },
      items: [],
      clients: [],
      broadcasts: [],
      chat: [],
      digests: [],
      materials: [],
      creations: [],
      isPro: false,
      usage: { month: monthKey(), count: 0 },

      setOnboarded: (v) => set({ onboarded: v }),
      setProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      setPro: (v) => set({ isPro: v }),
      bumpUsage: () => {
        const m = monthKey();
        const u = get().usage;
        set({ usage: { month: m, count: u.month === m ? u.count + 1 : 1 } });
      },

      addItem: (i) => {
        const item: Item = { ...i, id: uid(), createdAt: nowIso() };
        set({ items: [item, ...get().items] });
        return item;
      },
      updateItem: (id, patch) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      upsertClient: (c) => {
        const existing =
          (c.id && get().clients.find((x) => x.id === c.id)) ||
          get().clients.find((x) => normalize(x.name) === normalize(c.name)) ||
          (c.phone ? get().clients.find((x) => x.phone && x.phone === c.phone) : undefined);
        if (existing) {
          const merged: Client = {
            ...existing,
            ...Object.fromEntries(Object.entries(c).filter(([, v]) => v !== undefined && v !== '')),
            notes: c.notes ? [existing.notes, c.notes].filter(Boolean).join('\n') : existing.notes,
            tags: Array.from(new Set([...(existing.tags ?? []), ...(c.tags ?? [])])),
            interests: Array.from(new Set([...(existing.interests ?? []), ...(c.interests ?? [])])),
            agreements: [...(existing.agreements ?? []), ...(c.agreements ?? [])],
            touches: [...(c.touches ?? []), ...(existing.touches ?? [])].slice(0, 100),
            lastTouchAt: nowIso(),
          };
          set({ clients: get().clients.map((x) => (x.id === existing.id ? merged : x)) });
          return merged;
        }
        const client: Client = {
          stage: 'lead',
          tags: [],
          ...c,
          id: uid(),
          createdAt: nowIso(),
          lastTouchAt: nowIso(),
        };
        set({ clients: [client, ...get().clients] });
        return client;
      },
      updateClient: (id, patch) =>
        set({
          clients: get().clients.map((c) =>
            c.id === id ? { ...c, ...patch, lastTouchAt: nowIso() } : c,
          ),
        }),
      removeClient: (id) => set({ clients: get().clients.filter((c) => c.id !== id) }),

      addBroadcast: (b) => {
        const br: Broadcast = { ...b, id: uid(), createdAt: nowIso(), sentIds: [] };
        set({ broadcasts: [br, ...get().broadcasts] });
        return br;
      },
      updateBroadcast: (id, patch) =>
        set({ broadcasts: get().broadcasts.map((b) => (b.id === id ? { ...b, ...patch } : b)) }),
      markBroadcastSent: (id, clientId) =>
        set({
          broadcasts: get().broadcasts.map((b) =>
            b.id === id && !b.sentIds.includes(clientId)
              ? { ...b, sentIds: [...b.sentIds, clientId] }
              : b,
          ),
        }),

      addDigest: (d) => {
        const digest: Digest = { ...d, id: uid(), createdAt: nowIso() };
        set({ digests: [digest, ...get().digests] });
        return digest;
      },
      updateDigest: (id, patch) =>
        set({ digests: get().digests.map((d) => (d.id === id ? { ...d, ...patch } : d)) }),
      removeDigest: (id) => set({ digests: get().digests.filter((d) => d.id !== id) }),

      addMaterial: (m) => {
        const material: Material = { ...m, id: uid(), createdAt: nowIso() };
        set({ materials: [material, ...get().materials] });
        return material;
      },
      removeMaterial: (id) => set({ materials: get().materials.filter((m) => m.id !== id) }),
      addCreation: (c) => {
        const creation: Creation = { ...c, id: uid(), createdAt: nowIso() };
        set({ creations: [creation, ...get().creations] });
        return creation;
      },
      updateCreation: (id, patch) =>
        set({ creations: get().creations.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
      removeCreation: (id) => set({ creations: get().creations.filter((c) => c.id !== id) }),

      pushChat: (role, text) =>
        set({ chat: [...get().chat, { id: uid(), role, text, at: nowIso() }].slice(-200) }),
      clearChat: () => set({ chat: [] }),
    }),
    {
      name: 'zumi-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const findClientByName = (name?: string) => {
  if (!name) return undefined;
  const n = normalize(name);
  // crude stem so "Марине"/"Мариной" still match "Марина"
  const stem = n.length > 4 ? n.slice(0, -2) : n;
  const clients = useStore.getState().clients;
  return (
    clients.find((c) => normalize(c.name) === n) ??
    clients.find((c) => normalize(c.name).split(' ').some((w) => w.startsWith(stem)))
  );
};

/** True once the persisted store has been read from disk. */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useStore.persist.onFinishHydration(cb),
    () => useStore.persist.hasHydrated(),
  );
}
