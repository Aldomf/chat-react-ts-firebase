import { create } from "zustand";

interface TypingState {
  typingStatus: { [key: string]: boolean }; // { [friendId: string]: isTyping }
  setTypingStatus: (friendId: string, isTyping: boolean) => void;
}

export const useTypingListFriendStore = create<TypingState>()((set) => ({
  typingStatus: {},
  setTypingStatus: (friendId, isTyping) => set((state) => ({
    typingStatus: {
      ...state.typingStatus,
      [friendId]: isTyping
    }
  })),
}));
