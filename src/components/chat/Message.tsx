import { cn } from "@/lib/utils";

interface MessageProps {
  message: string;
  date: string;
  isCurrentUser: boolean;
  photoUrl: string;
}

function Message({ message, date, isCurrentUser, photoUrl }: MessageProps) {
  return (
    <div
      className={cn(
        "flex items-end py-2 px-6 space-y-2 w-full",
        {
          "justify-end": isCurrentUser,
        }
      )}
    >
      {!isCurrentUser && (
        <img
          src={photoUrl}
          alt="chat-messages"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div className={cn("text-[#64748F] bg-white rounded-lg p-2 max-w-[65%]", {
        "bg-[#2563EB]": isCurrentUser,
        "text-white": isCurrentUser,
      })}>
        <p className="">{message}</p>
        <div className="flex justify-end items-end min-w-36">
          <p className="text-end text-xs text-[#A6A3B8] ">{date}</p>
        </div>
      </div>
    </div>
  );
}

export default Message;
