import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/store/chat-store";

function Chat() {
  const { friend } = useChatStore();

  if (!friend) return (
    <div className="h-screen flex flex-col items-center justify-center border-x border-gray-200">
      <p>Select a friend to start chatting</p>
    </div>
  )

  return (
    <div className="h-screen border-x border-gray-200 grid grid-rows-[1fr_6fr_1fr]">
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  );
}

export default Chat;
