import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { Message as MessageType } from "@/schemas/firestore-schema";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";
import { useChatStore } from "@/store/chat-store";
import { differenceInDays, format, isToday, isYesterday } from "date-fns";

function ChatMessages() {
  const db = useFirestore();
  const auth = useAuth();
  const { friend } = useChatStore();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<MessageType[]>([]);

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
    const roomRef = doc(db, "rooms", friend!.roomid);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const currentMessages = snapshot.data()?.messages || [];
      setMessage(currentMessages);
  
      if (currentMessages.length > 0) {
        const updatedMessages = currentMessages.map((message: MessageType) => {
          if (message.isRead === false && message.uid === friend!.uid) {
            return { ...message, isRead: true };
          }
          return message;
        });
  
        // Only update if there is a change
        if (JSON.stringify(currentMessages) !== JSON.stringify(updatedMessages)) {
          updateDoc(roomRef, {
            messages: updatedMessages,
          });
        }
      }
    });
  
    return unsubscribe;
  }, [friend]);
  

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [message]);

  return (
    <div
      ref={scrollAreaRef}
      className="bg-[#DBEAFE] border-y border-[#DBEAFE] overflow-y-auto scrollable"
    >
      {message.length > 0 ? message.map((message, index) => (
        <Message
          key={index}
          date={getMessageTimeDisplay(message.timestamp)} // 'p' is for time in 'hh:mm AM/PM' format
          message={message.message}
          isCurrentUser={message.uid === auth.currentUser!.uid}
          photoUrl={friend!.photoURL}
          isRead={message.isRead}
        />
      )) : <p className="text-center text-sm text-yellow-600 bg-slate-100 rounded-xl p-2 md:mx-60 border-yellow-600 border">No messages yet, start chatting!</p>}
    </div>
  );
}

export default ChatMessages;
