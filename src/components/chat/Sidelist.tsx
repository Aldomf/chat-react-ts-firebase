import { useChatStore } from "@/store/chat-store";
import FirstSectionSidelist from "./FirstSectionSidelist"
import FriendsList from "./FriendsList"
import SearchContact from "./SearchContact"

function Sidelist() {
  const { friend } = useChatStore();

  return (
    <div className={!friend ? "" : "hidden md:inline-block"}>
        <FirstSectionSidelist/>
        <SearchContact/>
        <FriendsList/>
    </div>
  )
}

export default Sidelist