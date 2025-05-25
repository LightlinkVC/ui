// store/CallStore.ts
import { create } from 'zustand';

interface CallState {
  activeRoomId: string | null;
  activateRoom: (roomId: string) => void;
  deactivateRoom: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  activeRoomId: null,
  activateRoom: (roomId) => set({ activeRoomId: roomId }),
  deactivateRoom: () => set({ activeRoomId: null }),
}));
