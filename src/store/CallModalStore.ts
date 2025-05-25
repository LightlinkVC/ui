// store/callModalStore.ts
import { create } from 'zustand';

type CallModalState = {
  isOpen: boolean;
  username: string | null;
  onAccept?: () => void;
  onDecline?: () => void;
  showModal: (username: string, onAccept?: () => void, onDecline?: () => void) => void;
  closeModal: () => void;
};

export const useCallModalStore = create<CallModalState>((set) => ({
  isOpen: false,
  username: null,
  onAccept: undefined,
  onDecline: undefined,
  showModal: (username, onAccept, onDecline) =>
    set({ isOpen: true, username, onAccept, onDecline }),
  closeModal: () =>
    set({ isOpen: false, username: null, onAccept: undefined, onDecline: undefined }),
}));
