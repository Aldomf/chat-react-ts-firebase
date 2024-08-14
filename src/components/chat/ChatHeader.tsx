import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useChatStore } from "@/store/chat-store";
import { useTypingStore } from "@/store/typing-store";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { useFirestore } from "reactfire";

function ChatHeader() {
  const db = useFirestore();
  const { resetFriend, friend } = useChatStore();
  const { isUserTyping, setIsUserTyping } = useTypingStore();

  useEffect(() => {
    if (friend) {
      const friendTypingRef = doc(db, "users", friend.uid);

      const unsubscribe = onSnapshot(friendTypingRef, (doc) => {
        const data = doc.data();
        if (data) {
          setIsUserTyping(data.isTyping);
        }
      });

      return () => unsubscribe(); // Clean up the listener when the component unmounts
    }
  }, [friend, db, setIsUserTyping]);

  return (
    <div className="flex justify-between items-center px-2 md:px-6 md:relative bg-white">
      <Card className="flex py-2 rounded-none border-none shadow-none">
        <div className="flex items-center justify-center py-0">
          <Avatar className="rounded-md w-14 h-14 mr-2">
            <AvatarImage src={friend?.photoURL} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="py-0 w-20 md:w-[75%] space-y-2">
          <CardHeader className="h-fit py-0 px-0">
            <CardTitle className="text-lg text-[#64748B] truncate">
              {friend?.displayName}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center py-0 px-0">
            <p className="text-xs w-60 text-[#A6A3B8] font-medium truncate mr-2">
              {isUserTyping ? "Typing..." : "Active"}
            </p>
          </CardContent>
        </div>
      </Card>
      <div className="flex items-center">
        <Button onClick={resetFriend}>Close chat</Button>
      </div>
    </div>
  );
}

export default ChatHeader;
