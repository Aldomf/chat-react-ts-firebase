import { create } from "zustand";

type Store = {
  isProfileVisible: boolean;
  toggleProfileSidebar: () => void;
};

export const useProfileStore = create<Store>()((set) => ({
  isProfileVisible: false,
  toggleProfileSidebar: () => set((state) => ({ isProfileVisible: !state.isProfileVisible })),
}));

