import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";
import { UserRoom, Message } from "@/schemas/firestore-schema";
import { useChatStore } from "@/store/chat-store";
import { differenceInDays, format, isToday, isYesterday } from "date-fns";

interface Friend {
  uid: string;
  displayName: string;
  photoURL: string;
  lastMessage: string;
  roomid: string;
  timestamp: string;
  unreadCount: number; // Add this field to store the count of unread messages
}

function FriendsList() {
  const db = useFirestore();
  const auth = useAuth();
  const { setFriend, friend } = useChatStore();
  const [friends, setFriends] = useState<Friend[]>([]);

  const getMessageTimeDisplay = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    if (isToday(messageDate)) {
      return format(messageDate, "h:mm a");
    } else if (isYesterday(messageDate)) {
      return "Yesterday";
    } else if (differenceInDays(new Date(), messageDate) <= 7) {
      return format(messageDate, "EEEE");
    } else {
      return format(messageDate, "P");
    }
  };

  useEffect(() => {
    const userRef = doc(db, "users", auth.currentUser!.uid);
    const unsubscribe = onSnapshot(userRef, (document) => {
      const friendPromises = document.data()?.rooms.map((room: UserRoom) => {
        const friendRef = doc(db, "users", room.friendId);
        return getDoc(friendRef).then((friendDoc) => {
          const roomRef = doc(db, "rooms", room.roomid);
          return getDoc(roomRef).then((roomDoc) => {
            const roomData = roomDoc.data();
            const unreadCount = roomData?.messages.filter(
              (msg: Message) =>
                msg.uid !== auth.currentUser!.uid &&
                msg.isRead !== undefined &&
                !msg.isRead
            ).length;

            return {
              uid: friendDoc.id,
              displayName: friendDoc.data()?.displayName,
              photoURL: friendDoc.data()?.photoURL,
              lastMessage: room.lastMessage,
              roomid: room.roomid,
              timestamp: room.timestamp,
              unreadCount: unreadCount || 0, // Add unread message count
            };
          });
        });
      });

      Promise.all(friendPromises).then((friends) => {
        setFriends(friends);
      });
    });

    return unsubscribe;
  }, [friend]);

  if (friends.length === 0) {
    return (
      <div className="text-center">
        No friends found, please add some friends!
      </div>
    );
  }

  return (
    <ScrollArea
      className={
        !friend
          ? "max-h-[calc(100vh-120px)] overflow-y-auto"
          : "hidden md:inline-block"
      }
    >
      {friends.map((friend, index) => (
        <Card
          key={index}
          className={`flex py-2 rounded-none hover:bg-[#F1F5F9] cursor-pointer shadow-none pr-2 ${
            friend.unreadCount > 0 ? "bg-[#F1F5F9]" : ""
          }`}
          onClick={() => setFriend(friend)}
        >
          <div className="flex items-center justify-center py-0 w-[35%]">
            <Avatar className="rounded-md w-[60%] h-full">
              <AvatarImage src={friend.photoURL} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className="py-0 w-[75%] space-y-2">
            <CardHeader className="h-fit py-0 px-0">
              <CardTitle className="text-lg text-[#64748B] flex justify-between">
                {friend.displayName}
                {friend.timestamp && (
                  <p className={`text-[10px] w-[20%] text-[#A6A3B8] text-right ${
                    friend.unreadCount > 0 ? "text-blue-500 font-bold" : ""
                  }`}>
                    {getMessageTimeDisplay(friend.timestamp)}
                  </p>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center py-0 px-0">
              <p className="text-xs w-60 text-[#A6A3B8] font-medium truncate mr-2">
                {friend.lastMessage}
              </p>
              {friend.unreadCount > 0 && (
                <div className="w-[20%] flex justify-end items-center">
                  <span className="text-sm text-white font-semibold  border border-blue-500 bg-blue-500 rounded-full size-6 flex items-center justify-center">
                    {friend.unreadCount}
                  </span>
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      ))}
    </ScrollArea>
  );
}

export default FriendsList;
