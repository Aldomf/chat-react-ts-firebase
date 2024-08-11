import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FaFaceSmile } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useAuth, useFirestore } from "reactfire";
import { useChatStore } from "@/store/chat-store";
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { Message, UserRoom } from "@/schemas/firestore-schema";

function ChatInput() {
  const db = useFirestore();
  const auth = useAuth();
  const { friend } = useChatStore();

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
        const roomRef = doc(db, "rooms", friend!.roomid);
        const messages: Message = {
          message: inputValue,
          timestamp: new Date().toISOString(),
          uid: auth.currentUser!.uid,
        };

        await updateDoc(roomRef, {
          messages: arrayUnion(messages),
        });

        //update last message
        const userRef = doc(db, "users", auth.currentUser!.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const rooms = userData.rooms || [];
      
          // Find the room that matches the friendId
          const roomToUpdate = rooms.find((room: UserRoom) => room.friendId === friend?.uid);
      
          if (roomToUpdate) {
            // Remove the old room entry
            await updateDoc(userRef, {
              rooms: arrayRemove(roomToUpdate),
            });
      
            // Update the lastMessage and timestamp, then add the updated room back
            roomToUpdate.lastMessage = inputValue;
            roomToUpdate.timestamp = new Date().toISOString();
      
            await updateDoc(userRef, {
              rooms: arrayUnion(roomToUpdate),
            });
          }
        }

        await updateDoc(userRef, {
          rooms: arrayUnion({
            timestamp: new Date().toISOString(),
            lastMessage: inputValue,
          }),
        });

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

  return (
    <div className="relative flex items-center space-x-4 px-6">
      <Button
        className="bg-[#E2E8F0] rounded-full hover:bg-[#DBEAFE]"
        onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
      >
        <FaFaceSmile className="text-black text-2xl" />
      </Button>

      {emojiPickerVisible && (
        <div ref={emojiPickerRef} className="absolute bottom-16">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      <Input
        value={inputValue}
        onKeyDown={handleKeyDown}
        onChange={(e) => setInputValue(e.target.value)}
        className="bg-[#E2E8F0]"
      />

      <Button
        className="rounded-full bg-transparent hover:bg-[#DBEAFE]"
        onClick={handleSubmit}
      >
        <IoIosSend className="text-black text-2xl" />
      </Button>
    </div>
  );
}

export default ChatInput;
