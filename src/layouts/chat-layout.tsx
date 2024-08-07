import Chat from "@/components/chat/Chat";
import Profile from "@/components/chat/Profile";
import Sidelist from "@/components/chat/Sidelist";

function ChatLayout() {
  return (
    <div className="md:grid md:grid-cols-[1.2fr_3fr_1fr] h-screen">
      <Sidelist />
      <Chat />
      <Profile />
    </div>
  );
}

export default ChatLayout;
