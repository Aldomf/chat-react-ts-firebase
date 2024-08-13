import { useUser } from "reactfire";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useProfileStore } from "@/store/toggleProfile-store";

function FirstSectionSidelist() {
  const { data: user } = useUser();
  const { toggleProfileSidebar } = useProfileStore();

  return (
    <div className="flex justify-between items-center px-4 pt-3">
      <h2 className="text-3xl font-bold">Chats</h2>
      <Avatar className="rounded-full h-16 w-16 md:hidden" onClick={toggleProfileSidebar}>
        <AvatarImage src={user?.photoURL || ""} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  );
}

export default FirstSectionSidelist;
