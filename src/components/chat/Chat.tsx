import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChatStore } from "@/store/chat-store";
import { useTheme } from "../theme-provider";

function Chat() {
  const { friend } = useChatStore();
  const { theme } = useTheme();

  // Determine background class based on theme and screen size
  const bgClass = theme === "dark"
    ? (window.innerWidth >= 1024 ? "bg-dark-mode-lg" : "bg-dark-mode")
    : (window.innerWidth >= 1024 ? "bg-light-mode-lg" : "bg-light-mode");

  if (!friend) return (
    <div className="h-screen md:flex md:flex-col md:items-center md:justify-center md:border-x md:border-gray-200 dark:border-gray-800 hidden">
      <p>Select a friend to start chatting</p>
    </div>
  )

  return (
    <div
      className={friend
        ? `h-screen md:border-x md:border-gray-200 dark:border-gray-800 grid grid-rows-[auto_6fr_auto] bg-cover bg-center bg-no-repeat ${bgClass}`
        : `h-screen border-x border-gray-200 dark:border-gray-800 md:grid md:grid-rows-[1fr_6fr_1fr] hidden ${bgClass}`
      }
    >
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  );
}

export default Chat;
