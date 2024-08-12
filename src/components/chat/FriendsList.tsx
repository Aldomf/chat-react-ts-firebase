import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";
import { UserRoom } from "@/schemas/firestore-schema";
import { useChatStore } from "@/store/chat-store";
import { differenceInDays, format, isToday, isYesterday } from "date-fns";

interface Friend {
  uid: string;
  displayName: string;
  photoURL: string;
  lastMessage: string;
  roomid: string;
  timestamp: string;
}

function FriendsList() {
  const db = useFirestore();
  const auth = useAuth();

  const { setFriend } = useChatStore();

  const [friends, setFriends] = useState<Friend[]>([]);

  // Assuming message.timestamp is a valid date object or timestamp
  const getMessageTimeDisplay = (timestamp: string) => {
    const messageDate = new Date(timestamp);

    if (isToday(messageDate)) {
      return format(messageDate, "h:mm a"); // Shows '3:45 PM'
    } else if (isYesterday(messageDate)) {
      return "Yesterday";
    } else if (differenceInDays(new Date(), messageDate) <= 7) {
      return format(messageDate, "EEEE"); // Shows the day of the week like 'Monday'
    } else {
      return format(messageDate, "P"); // Shows the date, like '08/12/2024'
    }
  };

  useEffect(() => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    const unsubcribe = onSnapshot(userRef, (document) => {
      const friendPromises = document.data()?.rooms.map((room: UserRoom) => {
        const friendRef = doc(db, "users", room.friendId);
        return getDoc(friendRef);
      });

      Promise.all(friendPromises).then((friends) => {
        const data = friends.map((friend) => {
          const data = friend.data();

          const room: UserRoom = document
            .data()
            ?.rooms.find((room: UserRoom) => room.friendId === friend.id);

          return {
            uid: data.uid,
            displayName: data.displayName,
            photoURL: data.photoURL,
            lastMessage: room?.lastMessage,
            roomid: room?.roomid,
            timestamp: room?.timestamp,
          };
        });

        setFriends(data);
      });
    });

    return unsubcribe;
  }, []);

  if (friends.length === 0) {
    return <div className="text-center">No friends found, please add some friends!</div>;
  }

  return (
    <ScrollArea className="max-h-[calc(100vh-120px)] overflow-y-auto">
      {friends.map((friend, index) => (
        <Card
          key={index}
          className="flex py-2 rounded-none hover:bg-[#F1F5F9] cursor-pointer shadow-none"
          onClick={() => setFriend(friend)}
        >
          <div className="flex items-center justify-center py-0 w-[35%] ">
            <Avatar className="rounded-md w-[60%] h-full">
              <AvatarImage src={friend.photoURL} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className="py-0 w-[75%] space-y-2">
            <CardHeader className="h-fit py-0 px-0">
              <CardTitle className="text-lg text-[#64748B]">
                {friend.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center py-0 px-0">
              <p className="text-xs w-60 text-[#A6A3B8] font-medium truncate mr-2">
                {friend.lastMessage}
              </p>
              {friend.timestamp && (
                <p className="text-[10px] w-[20%] text-[#A6A3B8]">
                  {getMessageTimeDisplay(friend.timestamp)}
                </p>
              )}
            </CardContent>
          </div>
        </Card>
      ))}
    </ScrollArea>
  );
}

export default FriendsList;
