import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useChatStore } from "@/store/chat-store";
import { useTypingStore } from "@/store/typing-store";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestore } from "reactfire";
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { useRecordingStore } from "@/store/recording-store";

function ChatHeader() {
  const db = useFirestore();
  const { resetFriend, friend } = useChatStore();
  const { isUserTyping, setIsUserTyping } = useTypingStore();
  const { isUserRecording, setIsUserRecording } = useRecordingStore();
  const [isOnline, setIsOnline] = useState<boolean | undefined>(undefined);
  const [lastActive, setLastActive] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (friend) {
      const friendDocRef = doc(db, "users", friend.uid);

      const unsubscribe = onSnapshot(friendDocRef, (doc) => {
        const data = doc.data();
        if (data) {
          setIsUserTyping(data.isTyping);
          setIsOnline(data.isOnline);
          setLastActive(data.lastActive?.toDate());
          setIsUserRecording(data.isRecording);
        }
      });

      return () => unsubscribe(); // Clean up the listener when the component unmounts
    }
  }, [friend, db, setIsUserTyping, setIsUserRecording]);

  const getStatusMessage = () => {
    if (isOnline) {
      return "Online";
    } else if (lastActive) {
      const now = new Date();
      if (isToday(lastActive)) {
        return `Last active at ${format(lastActive, "h:mm a")}`; // Shows '3:45 PM'
      } else if (isYesterday(lastActive)) {
        return `Last active yesterday at ${format(lastActive, "h:mm a")}`; // Shows '3:45 PM'
      } else if (differenceInDays(now, lastActive) <= 7) {
        return `Last active on ${format(lastActive, "EEEE")}`; // Shows the day of the week like 'Monday'
      } else {
        return `Last active on ${format(lastActive, "P")}`; // Shows the date, like '08/12/2024'
      }
    } else {
      return "Status unknown";
    }
  };

  return (
    <div className="flex justify-between items-center px-2 md:px-6 md:relative bg-white">
      <Card className="flex py-2 rounded-none shadow-none border-none w-48">
        <div className="flex items-center justify-center py-0">
          <Avatar className="rounded-md w-14 h-14 mr-2">
            <AvatarImage src={friend?.photoURL} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="py-0 w-32 md:w-[75%] space-y-2">
          <CardHeader className="h-fit py-0 px-0">
            <CardTitle className="text-lg text-[#64748B] truncate">
              {friend?.displayName}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center py-0 px-0">
            <p className="text-xs w-60 text-[#A6A3B8] font-medium mr-2">
            {isUserTyping ? "Typing..." : isUserRecording ? "Recording..." : getStatusMessage()}
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
