import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

function Chat() {
  return (
    <div className="h-screen border-x border-gray-200 grid grid-rows-[1fr_6fr_1fr]">
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  );
}

export default Chat;
