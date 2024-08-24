import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";
import { UserRoom, Message } from "@/schemas/firestore-schema";
import { useChatStore } from "@/store/chat-store";
import { differenceInDays, format, isToday, isYesterday } from "date-fns";
import { useTypingListFriendStore } from "@/store/typing-listFriend-store";
import { useRecordingListFriendStore } from "@/store/recording-listFriend-store";

interface Friend {
  uid: string;
  displayName: string;
  photoURL: string;
  lastMessage: string;
  roomid: string;
  timestamp: string;
  unreadCount: number;
}

function FriendsList() {
  const db = useFirestore();
  const auth = useAuth();
  const { setFriend, friend } = useChatStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const { typingStatus, setTypingStatus } = useTypingListFriendStore();
  const { recordingStatus, setRecordingStatus } = useRecordingListFriendStore();

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

  // Fetch friends and their last message data
  useEffect(() => {
    const fetchFriends = async () => {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      const unsubscribe = onSnapshot(userRef, async (document) => {
        const rooms = document.data()?.rooms || []; // Default to empty array if undefined
        const friendPromises = rooms.map(async (room: UserRoom) => {
          const friendRef = doc(db, "users", room.friendId);
          const friendDoc = await getDoc(friendRef);
          const roomRef = doc(db, "rooms", room.roomid);
          const roomDoc = await getDoc(roomRef);
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
            unreadCount: unreadCount || 0,
          };
        });
    
        const friendsList = await Promise.all(friendPromises);
    
        // Sort friends by timestamp in descending order
        friendsList.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setFriends(friendsList);
      });
    
      return unsubscribe;
    };
    

    if (auth.currentUser) {
      fetchFriends();
    }
  }, [auth.currentUser?.uid]); // Depend on the user ID to re-fetch friends if the user changes

  // Listen for changes in the specific room's `isRead` field
  useEffect(() => {
    if (!friend) return;

    const roomRef = doc(db, "rooms", friend.roomid);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const roomData = snapshot.data();
      if (roomData) {
        const unreadCount = roomData.messages.filter(
          (msg: Message) =>
            msg.uid !== auth.currentUser!.uid &&
            msg.isRead !== undefined &&
            !msg.isRead
        ).length;

        setFriends((prevFriends) =>
          prevFriends.map((f) =>
            f.roomid === friend.roomid ? { ...f, unreadCount } : f
          )
        );
      }
    });

    return unsubscribe;
  }, [friend, auth.currentUser?.uid]); // Depend on `friend` to listen to the correct room

  // Listen for typing status changes for all friends
  useEffect(() => {
    const fetchTypingStatus = async () => {
      const userRef = doc(db, "users", auth.currentUser!.uid);
      const userDoc = (await getDoc(userRef)).data();
      if (userDoc) {
        userDoc.friends.map(async (friendId: string) => {
          const friendRef = doc(db, "users", friendId);
          const unsubscribe = onSnapshot(friendRef, (doc) => {
            const friendData = doc.data();
            if (friendData) {
              setTypingStatus(friendId, friendData.isTyping || false);
              setRecordingStatus(friendId, friendData.isRecording || false);
            }
          });

          return unsubscribe;
        });
      }
    };

    fetchTypingStatus();
  }, [auth.currentUser?.uid, setTypingStatus, db]);

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
      {friends.map((f, index) => (
        <Card
          key={index}
          className={`flex py-2 rounded-none hover:bg-[#F1F5F9] dark:hover:bg-[#1a2330] cursor-pointer shadow-none pr-2 ${
            f.unreadCount > 0 ? "bg-[#F1F5F9] dark:bg-[#1a2330]" : ""
          }`}
          onClick={() => setFriend(f)}
        >
          <div className="flex items-center justify-center py-0 w-[35%]">
            <Avatar className="rounded-md w-[60%] h-full">
              <AvatarImage src={f.photoURL} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
          <div className="py-0 w-[75%] space-y-2">
            <CardHeader className="h-fit py-0 px-0">
              <CardTitle className="text-lg text-[#64748B] flex justify-between">
                {f.displayName}
                {f.timestamp && (
                  <p
                    className={`text-[10px] w-[20%] text-[#A6A3B8] text-right ${
                      f.unreadCount > 0 ? "text-blue-500 font-bold" : ""
                    }`}
                  >
                    {getMessageTimeDisplay(f.timestamp)}
                  </p>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center py-0 px-0">
              <p className={`text-xs w-60 text-[#A6A3B8] font-medium truncate mr-2 ${typingStatus[f.uid] || recordingStatus[f.uid] ? "text-blue-500" : ""}`}>
                {typingStatus[f.uid] ? "Typing..." : recordingStatus[f.uid] ? "Recording..." : f.lastMessage}
              </p>
              {f.unreadCount > 0 && (
                <div className="w-[20%] flex justify-end items-center">
                  <span className="text-sm text-white font-semibold border border-blue-500 bg-blue-500 rounded-full size-6 flex items-center justify-center">
                    {f.unreadCount}
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
