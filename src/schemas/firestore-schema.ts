import { Timestamp } from "firebase/firestore";

export interface UserRoom {
  roomid: string;
  lastMessage: string;
  timestamp: string;
  friendId: string;
}

export interface Message {
  audioUrl?: string; // URL to the audio file
  message?: string;
  timestamp: string;
  uid: string;
  isRead: boolean;
  isListened?: boolean;
  messageId?: string; // Add this to identify the message
}

// user schema
export interface UserDB {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
  isTyping: boolean;
  isRecording: boolean;
  friends: string[];
  rooms: UserRoom[];
  fcmToken?: string;
  isOnline?: boolean;
  lastActive?: Timestamp;
}

// room schema
export interface RoomDB {
  messages: Message[];
  users: string[];
}
