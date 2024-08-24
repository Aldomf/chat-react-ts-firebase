import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useAuth, useUser } from "reactfire";
import { useChatStore } from "@/store/chat-store";
import { useProfileStore } from "@/store/toggleProfile-store";
import { IoMdClose } from "react-icons/io";
import { ModeToggle } from "../mode-toggle";

function Profile() {
  const auth = useAuth();
  const { data: user } = useUser();
  const { resetFriend } = useChatStore();
  const { toggleProfileSidebar } = useProfileStore();

  const handleClickSignOut = async () => {
    resetFriend();
    await auth.signOut();
  };

  return (
    <div className="relative md:flex md:flex-col md:items-center bg-white dark:bg-[#020817]">
      <div className="relative overflow-hidden w-full h-44">
        <IoMdClose
          className="absolute top-2 left-2 text-white cursor-pointer w-8 h-8 lg:hidden"
          onClick={toggleProfileSidebar}
        />
        <img
          src="/profile-dog.jpg"
          alt="profile-dog"
          className="w-full object-cover object-top"
        />
      </div>
      <div className="flex flex-col items-center -mt-7">
        <Avatar className="rounded-md h-16 w-16 border-2 border-white">
          <AvatarImage src={user?.photoURL || ""} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h3 className="mt-2 text-[#6E748B] text-xl font-semibold">
          {user?.displayName}
        </h3>
        <p className="mt-2 text-[#A9A9B8] text-xs font-semibold">Active now</p>
      </div>
      <div className="flex justify-center w-full">
        <Button
          className="mt-4 w-full mx-4 md:mx-0 md:w-[80%]"
          onClick={() => {
            handleClickSignOut();
            toggleProfileSidebar();
          }}
        >
          Log out
        </Button>
      </div>
      <div className="flex justify-center w-full mt-5">
      <ModeToggle />
      </div>
    </div>
  );
}

export default Profile;
