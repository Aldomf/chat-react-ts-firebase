import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";
import { UserRoom } from "@/schemas/firestore-schema";

interface Friend {
  uid: string;
  displayName: string;
  photoURL: string;
  lastMessage: string;
}

function FriendsList() {
  const db = useFirestore();
  const auth = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);

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

          return {
            uid: data.uid,
            displayName: data.displayName,
            photoURL: data.photoURL,
            lastMessage: data.rooms[0].lastMessage,
          };
        });

        setFriends(data);
        
      });
    });

    return unsubcribe;
  }, []);

  return (
    <ScrollArea className="max-h-[calc(100vh-130px)] overflow-y-auto">
      {friends.map((friend, index) => (
        <Card
          key={index}
          className="flex py-2 rounded-none hover:bg-[#F1F5F9] cursor-pointer border-none shadow-none"
        >
          <div className="flex items-center justify-center py-0 w-[35%]">
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
              <p className="text-[10px] w-[20%] text-[#A6A3B8]">45 min</p>
            </CardContent>
          </div>
        </Card>
      ))}
    </ScrollArea>
  );
}

export default FriendsList;

