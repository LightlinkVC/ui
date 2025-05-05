// store/FriendRequestModalStore.ts
import { create } from 'zustand';

interface FriendRequestModalState {
  isOpen: boolean;
  username: string | null;
  message: string | null;
  close: () => void;
  show: (username: string, message: string) => void;
}

export const useFriendRequestModalStore = create<FriendRequestModalState>((set) => ({
  isOpen: false,
  username: null,
  message: null,
  show: (username, message) => set({ isOpen: true, username, message }),
  close: () => set({ isOpen: false, username: null, message: null }),
}));
