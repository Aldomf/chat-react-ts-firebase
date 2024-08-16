import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { FaFaceSmile } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useAuth, useFirestore } from "reactfire";
import { useChatStore } from "@/store/chat-store";
import {
  arrayUnion,
  doc,
  Firestore,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Message, UserRoom } from "@/schemas/firestore-schema";
import { useTypingStore } from "@/store/typing-store";
// import { getMessaging } from "firebase/messaging";

const updateLastMessageandTimestamp = async (
  db: Firestore,
  uid: string,
  friendId: string,
  inputValue: string
) => {
  const userRef = doc(db, "users", uid);
  const { rooms } = (await getDoc(userRef)).data() as Uroom;

  const updatedRooms = rooms.map((room: UserRoom) => {
    if (room.friendId === friendId) {
      return {
        ...room,
        lastMessage: inputValue,
        timestamp: new Date().toISOString(),
      };
    }

    return room;
  });

  await updateDoc(userRef, {
    rooms: updatedRooms,
  });
};

interface Uroom {
  rooms: UserRoom[];
}

function ChatInput() {
  const db = useFirestore();
  const auth = useAuth();
  const { friend } = useChatStore();
  const { setIsUserTyping } = useTypingStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    // Assuming emojiObject contains an emoji property with the actual emoji character
    const emoji = emojiObject.emoji;
    setInputValue((prevValue) => prevValue + emoji);
  };

  // const getFriendFCMToken = async (friendUid: string): Promise<string | null> => {
  //   try {
  //     const userRef = doc(db, "users", friendUid);
  //     const userDoc = await getDoc(userRef);
  
  //     if (userDoc.exists()) {
  //       const userData = userDoc.data() as UserDB;
  //       return userData?.fcmToken || null; // Replace 'fcmToken' with your actual token field name
  //     }
  
  //     return null;
  //   } catch (error) {
  //     console.error('Error retrieving friend FCM token:', error);
  //     return null;
  //   }
  // };
  

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      try {
        // send message to firebase
        const roomRef = doc(db, "rooms", friend!.roomid);
        const messages: Message = {
          message: inputValue,
          timestamp: new Date().toISOString(),
          uid: auth.currentUser!.uid,
          isRead: false,
        };

        await updateDoc(roomRef, {
          messages: arrayUnion(messages),
        });

        //update last message and timestamp
        await updateLastMessageandTimestamp(
          db,
          auth.currentUser!.uid,
          friend!.uid,
          inputValue
        );
        await updateLastMessageandTimestamp(
          db,
          friend!.uid,
          auth.currentUser!.uid,
          inputValue
        );

       // Display a local notification
      if (Notification.permission === "granted") {
        console.log("first")
        new Notification("New message", {
          body: inputValue,
          icon: "/icon.png", // replace with the path to your icon
        });
      }

        setInputValue("");
        setIsUserTyping(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    const currentUserRef = doc(db, "users", auth.currentUser!.uid);
    updateDoc(currentUserRef, {
      isTyping: true,
    });

    // Clear the previous timeout to avoid multiple triggers
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to reset the typing state after the user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(currentUserRef, {
        isTyping: false,
      });
    }, 1000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setEmojiPickerVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="md:relative flex items-center space-x-2 md:space-x-4 py-2 md:py-0 px-2 md:px-6 bg-white">
      <FaFaceSmile
        className="w-10 h-10 rounded-full"
        onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
      />

      {emojiPickerVisible && (
        <div ref={emojiPickerRef} className="absolute bottom-16">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <Input
        ref={inputRef}
        value={inputValue}
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        placeholder="Type a message..."
        className="bg-[#E2E8F0]"
      />

      <IoIosSend className="rounded-full w-10 h-10" onClick={handleSubmit} />
    </div>
  );
}

export default ChatInput;
