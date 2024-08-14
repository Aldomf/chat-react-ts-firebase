import { create } from "zustand";

type Store = {
  isUserTyping: boolean;
  setIsUserTyping: (isUserTyping: boolean) => void;
};

export const useTypingStore = create<Store>()((set) => ({
  isUserTyping: false,
  setIsUserTyping: (isUserTyping: boolean) => set({ isUserTyping }),
}));

