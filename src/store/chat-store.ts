import { create } from "zustand";

interface Friend {
  displayName: string;
  photoURL: string;
  lastMessage: string;
  roomid: string;
  uid: string;
  timestamp: string;
}

type Store = {
  friend: Friend | null;
  setFriend: (friend: Friend) => void;
  resetFriend: () => void;
};

export const useChatStore = create<Store>()((set) => ({
  friend: null,
  setFriend: (friend: Friend) => set({ friend }),
  resetFriend: () => set({ friend: null }),
}));
