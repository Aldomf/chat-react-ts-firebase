import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { Message as MessageType } from "@/schemas/firestore-schema";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";
import { useChatStore } from "@/store/chat-store";
// import { format } from "timeago.js";
import { format } from 'date-fns';

function ChatMessages() {
  const db = useFirestore();
  const auth = useAuth();
  const { friend } = useChatStore();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<MessageType[]>([]);

  useEffect(() => {
    const roomRef = doc(db, "rooms", friend!.roomid);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      setMessage(snapshot.data()?.messages);
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
      {message.map((message, index) => (
        <Message
          key={index}
          date={format(new Date(message.timestamp), 'p')}  // 'p' is for time in 'hh:mm AM/PM' format
          message={message.message}
          isCurrentUser={message.uid === auth.currentUser!.uid}
          photoUrl={friend!.photoURL}
        />
      ))}
    </div>
  );
}

export default ChatMessages;
