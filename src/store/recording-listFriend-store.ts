import { create } from "zustand";

interface RecordingState {
  recordingStatus: { [key: string]: boolean }; // { [friendId: string]: isTyping }
  setRecordingStatus: (friendId: string, isRecording: boolean) => void;
}

export const useRecordingListFriendStore = create<RecordingState>()((set) => ({
  recordingStatus: {},
  setRecordingStatus: (friendId, isRecording) => set((state) => ({
    recordingStatus: {
      ...state.recordingStatus,
      [friendId]: isRecording
    }
  })),
}));
