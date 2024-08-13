import Chat from "@/components/chat/Chat";
import Profile from "@/components/chat/Profile";
import Sidelist from "@/components/chat/Sidelist";
import { useProfileStore } from "@/store/toggleProfile-store";

function ChatLayout() {
  const { isProfileVisible, toggleProfileSidebar } = useProfileStore();
  return (
    <div className="md:grid md:grid-cols-[1.2fr_3fr_1fr] h-screen">
      <Sidelist />
      <Chat />

      {/* Profile sidebar on mobile screens */}
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-white transition-transform duration-300 md:transform-none md:relative ${
          isProfileVisible ? "transform translate-x-0" : "transform translate-x-full"
        }`}
      >
        <Profile />
      </div>

      {/* Background overlay only on mobile screens */}
      {isProfileVisible && (
        <div
          className="fixed opacity-50 z-10 md:hidden"
          onClick={toggleProfileSidebar}
        />
      )}
    </div>
  );

}

export default ChatLayout;
