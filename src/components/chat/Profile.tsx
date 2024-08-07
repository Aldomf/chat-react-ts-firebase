import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Profile() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden w-full h-44">
        <img
          src="/profile-dog.jpg"
          alt="profile-dog"
          className="w-full object-cover object-top"
        />
      </div>
      <div className="flex flex-col items-center -mt-7">
        <Avatar className="rounded-md h-16 w-16 border-2 border-white">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h3 className="mt-2 text-[#6E748B] text-xl font-semibold">Aldo Miralles</h3>
        <p className="mt-2 text-[#A9A9B8] text-xs font-semibold">Active now</p>
      </div>
    </div>
  );
}

export default Profile;
