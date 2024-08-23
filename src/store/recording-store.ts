import { create } from "zustand";

type Store = {
  isUserRecording: boolean;
  setIsUserRecording: (isUserRecording: boolean) => void;
};

export const useRecordingStore = create<Store>()((set) => ({
  isUserRecording: false,
  setIsUserRecording: (isUserRecording: boolean) => set({ isUserRecording }),
}));