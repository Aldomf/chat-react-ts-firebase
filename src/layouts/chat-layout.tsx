import Chat from "@/components/chat/Chat";
import Profile from "@/components/chat/Profile";
import Sidelist from "@/components/chat/Sidelist";
import { useProfileStore } from "@/store/toggleProfile-store";

function ChatLayout() {
  const { isProfileVisible, toggleProfileSidebar } = useProfileStore();
  return (
    <div className="md:grid md:grid-cols-[1.2fr_3fr_0fr] lg:grid-cols-[1.2fr_3fr_1fr] h-screen">
      <Sidelist />
      <Chat />

      {/* Profile sidebar on mobile screens */}
      <div
        className={`fixed top-0 right-0 w-full md:w-1/2 lg:w-full h-full bg-white dark:bg-[#020817] transition-transform duration-300 lg:transform-none lg:relative z-20 ${
          isProfileVisible ? "transform translate-x-0" : "transform translate-x-full"
        }`}
      >
        <Profile />
      </div>

      {/* Background overlay */}
      {isProfileVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 hidden md:block lg:hidden transition-opacity duration-300"
          onClick={toggleProfileSidebar}
        ></div>
      )}
    </div>
  );

}

export default ChatLayout;
