export interface UserRoom {
  roomid: string;
  lastMessage: string;
  timestamp: string;
  friendId: string;
}

export interface Message {
  message: string;
  timestamp: string;
  uid: string;
}

// user schema
export interface UserDB {
  diesplayName: string;
  email: string;
  photoURL: string;
  uid: string;
  friends: string[];
  rooms: UserRoom[];
}

// room schema
export interface RoomDB {
  messages: Message[];
  users: string[];
}
