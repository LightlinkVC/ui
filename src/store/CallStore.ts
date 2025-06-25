// store/CallStore.ts
import { create } from 'zustand';

interface CallState {
  activeGroupId: string | null;
  activateGroup: (groupId: string) => void;
  deactivateGroup: () => void;
  activeRoomId: string | null;
  activateRoom: (roomId: string) => void;
  deactivateRoom: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  activeGroupId: null,
  activateGroup: (groupId: string) => set({ activeGroupId: groupId }),
  deactivateGroup: () => set({ activeGroupId: null }),
  activeRoomId: null,
  activateRoom: (roomId) => set({ activeRoomId: roomId }),
  deactivateRoom: () => set({ activeRoomId: null }),
}));
