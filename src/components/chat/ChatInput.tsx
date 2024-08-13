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
  const inputRef = useRef<HTMLInputElement>(null);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    // Assuming emojiObject contains an emoji property with the actual emoji character
    const emoji = emojiObject.emoji;
    setInputValue((prevValue) => prevValue + emoji);
  };

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      try {
        // send message to firebase
        const roomRef = doc(db, "rooms", friend!.roomid);
        const messages: Message = {
          message: inputValue,
          timestamp: new Date().toISOString(),
          uid: auth.currentUser!.uid,
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

        setInputValue(""); // Clear the input field after sending the message
      } catch (error) {
        console.log(error);
      }
    }
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
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
        className="bg-[#E2E8F0]"
      />

      <IoIosSend className="rounded-full w-10 h-10" onClick={handleSubmit} />
    </div>
  );
}

export default ChatInput;
