import type { ShareIntent } from 'expo-share-intent';

/** Hand-off between the Share Extension watcher and the /incoming screen. */
let pending: ShareIntent | null = null;

export const setPendingShare = (s: ShareIntent) => {
  pending = s;
};

export const takePendingShare = () => {
  const s = pending;
  pending = null;
  return s;
};
