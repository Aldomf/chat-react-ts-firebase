import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FaFaceSmile } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

function ChatInput() {
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    // Assuming emojiObject contains an emoji property with the actual emoji character
    const emoji = emojiObject.emoji;
    setInputValue((prevValue) => prevValue + emoji);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      console.log("Message sent:", inputValue); // Replace with actual send function
      setInputValue(""); // Clear the input field after sending the message
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
