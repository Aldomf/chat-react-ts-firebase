import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useAuth, useUser } from "reactfire";
import { useChatStore } from "@/store/chat-store";

function Profile() {
  const auth = useAuth()
  const { data: user } = useUser();
  const { resetFriend } = useChatStore();


  const handleClickSignOut = async () => {
    resetFriend();
    await auth.signOut();
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative overflow-hidden w-full h-44">
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
      <Button className="mt-4 w-[80%]" onClick={handleClickSignOut}>
        Log out
      </Button>
    </div>
  );
}

export default Profile;
