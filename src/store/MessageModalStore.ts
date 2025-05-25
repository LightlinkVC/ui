import { create } from 'zustand';

interface IncomingMessageModalStore {
  isOpen: boolean;
  username: string | null;
  message: string | null;
  show: (username: string, message: string) => void;
  close: () => void;
}

export const useIncomingMessageModalStore = create<IncomingMessageModalStore>((set) => ({
  isOpen: false,
  username: null,
  message: null,
  show: (username, message) => set({ isOpen: true, username, message }),
  close: () => set({ isOpen: false, username: null, message: null }),
}));
