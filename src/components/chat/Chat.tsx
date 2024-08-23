import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/store/chat-store";

function Chat() {
  const { friend } = useChatStore();

  if (!friend) return (
    <div className="h-screen md:flex md:flex-col md:items-center md:justify-center md:border-x md:border-gray-200 hidden">
      <p>Select a friend to start chatting</p>
    </div>
  )

  return (
    <div className={friend ? `h-screen md:border-x md:border-gray-200 grid grid-rows-[auto_6fr_auto] bg-cover bg-center bg-no-repeat` : `h-screen border-x border-gray-200 md:grid md:grid-rows-[1fr_6fr_1fr] hidden`} style={{ backgroundImage: "url('/bg-image-3.jpg')" }}>
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  );
}

export default Chat;
