import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FaFaceSmile } from "react-icons/fa6";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useAuth, useFirestore, useStorage } from "reactfire";
import { useChatStore } from "@/store/chat-store";
import {
  arrayUnion,
  doc,
  Firestore,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Message, UserDB, UserRoom } from "@/schemas/firestore-schema";
import { useTypingStore } from "@/store/typing-store";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MdMic } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { v4 as uuidv4 } from "uuid";
import { IoTrashOutline } from "react-icons/io5";

const updateLastMessageandTimestamp = async (
  db: Firestore,
  uid: string,
  friendId: string,
  inputValue: string
) => {
  const userRef = doc(db, "users", uid);
  const { rooms } = (await getDoc(userRef)).data() as Uroom;

  const updatedRooms = rooms.map((room: UserRoom) => {
    if (room.friendId === friendId) {
      return {
        ...room,
        lastMessage: inputValue,
        timestamp: new Date().toISOString(),
      };
    }

    return room;
  });

  await updateDoc(userRef, {
    rooms: updatedRooms,
  });
};

interface Uroom {
  rooms: UserRoom[];
}

function ChatInput() {
  const db = useFirestore();
  const auth = useAuth();
  const storage = useStorage(); // Initialize Firebase Storage
  const { friend } = useChatStore();
  const { setIsUserTyping } = useTypingStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isAudioReadyToSend, setIsAudioReadyToSend] = useState(false);

  const messageId = uuidv4();

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    // Assuming emojiObject contains an emoji property with the actual emoji character
    const emoji = emojiObject.emoji;
    setInputValue((prevValue) => prevValue + emoji);
  };

  const getFriendFCMToken = async (
    friendUid: string
  ): Promise<string | null> => {
    try {
      const userRef = doc(db, "users", friendUid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserDB;
        return userData?.fcmToken || null; // Replace 'fcmToken' with your actual token field name
      }

      return null;
    } catch (error) {
      console.error("Error retrieving friend FCM token:", error);
      return null;
    }
  };

  const handleAudioUpload = async (audioBlob: Blob): Promise<string | null> => {
    try {
      const audioRef = ref(
        storage,
        `audios/${auth.currentUser!.uid}/${Date.now()}.webm`
      );
      await uploadBytes(audioRef, audioBlob);
      const audioUrl = await getDownloadURL(audioRef);
      return audioUrl;
    } catch (error) {
      console.error("Audio upload failed:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (inputValue.trim() || audioBlob) {
      try {
        let audioUrl = null;

        if (audioBlob) {
          audioUrl = await handleAudioUpload(audioBlob);
        }

        const roomRef = doc(db, "rooms", friend!.roomid);
        const message: Message = {
          message: inputValue,
          timestamp: new Date().toISOString(),
          uid: auth.currentUser!.uid,
          isRead: false,
          messageId,
          ...(audioUrl && { audioUrl, isListened: false }), // Add audio URL if present
        };

        await updateDoc(roomRef, {
          messages: arrayUnion(message),
        });

        await updateLastMessageandTimestamp(
          db,
          auth.currentUser!.uid,
          friend!.uid,
          audioUrl ? "Audio Message" : inputValue
        );
        await updateLastMessageandTimestamp(
          db,
          friend!.uid,
          auth.currentUser!.uid,
          audioUrl ? "Audio Message" : inputValue
        );

        // Send notification
        const apiUrl = import.meta.env.VITE_API_URL;
        const friendFCMToken = await getFriendFCMToken(friend!.uid);
        if (friendFCMToken) {
          await fetch(`${apiUrl}/send-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: friendFCMToken,
              message: audioUrl
                ? "You have received a new audio message."
                : inputValue,
            }),
          });
        }

        setInputValue("");
        setAudioBlob(null); // Reset audioBlob after sending
        setIsUserTyping(false);
        setIsAudioReadyToSend(false);

        inputRef.current?.focus();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    const currentUserRef = doc(db, "users", auth.currentUser!.uid);
    updateDoc(currentUserRef, {
      isTyping: true,
    });

    // Clear the previous timeout to avoid multiple triggers
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to reset the typing state after the user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(currentUserRef, {
        isTyping: false,
      });
    }, 1000);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    // Store the stream in a ref to stop it later
    streamRef.current = stream;

    mediaRecorderRef.current.ondataavailable = (event) => {
      setAudioBlob(event.data);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    const currentUserRef = doc(db, "users", auth.currentUser!.uid);
    updateDoc(currentUserRef, {
      isRecording: true,
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      // Stop the recording
      mediaRecorderRef.current.stop();

      // Stop all tracks in the media stream to stop the microphone
      streamRef.current?.getTracks().forEach((track) => track.stop());

      // Update the user's recording status in the database
      const currentUserRef = doc(db, "users", auth.currentUser!.uid);
      updateDoc(currentUserRef, {
        isRecording: false,
      });
    }
    setIsRecording(false);
    setIsAudioReadyToSend(true);
  };

  // New cancel function to discard the recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setAudioBlob(null); // Discard the audio
      setIsRecording(false);
      setIsAudioReadyToSend(false);

      const currentUserRef = doc(db, "users", auth.currentUser!.uid);
      updateDoc(currentUserRef, {
        isRecording: false,
      });
    }
  };

  // Only trigger handleSubmit if the audio is ready to be sent
  useEffect(() => {
    if (audioBlob && isAudioReadyToSend) {
      handleSubmit();
    }
  }, [audioBlob, isAudioReadyToSend]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setEmojiPickerVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default behavior of adding a new line
      handleSubmit();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      // Adjust height based on content
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 90)}px`; // 60px is approximately 3 rows
    }
  }, [inputValue]);

  useEffect(() => {
    const bars = document.querySelectorAll(".bar");
  
    // Use type assertion to specify that bars are HTML elements
    bars.forEach((bar) => {
      const element = bar as HTMLElement;
      element.style.animationDuration = `${Math.random() * (0.75 - 0.25) + 0.25}s`;
    });
  }, [isRecording]); // Run this effect when isRecording changes
  

  return (
    <div className="md:relative flex items-center space-x-2 md:space-x-4 py-2 md:py-0 px-2 md:px-6 bg-white">
      {!isRecording && (
        <FaFaceSmile
          className="size-8 rounded-full"
          onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
        />
      )}

      {emojiPickerVisible && (
        <div ref={emojiPickerRef} className="absolute bottom-16">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {!isRecording && (
        <Textarea
          ref={inputRef}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="bg-[#E2E8F0] p-2 resize-none overflow-hidden min-h-0 hidden-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
        />
      )}

      <div className={isRecording ? "flex items-center justify-between space-x-2 w-full" : ""}>
      {isRecording && (
        <button
          onClick={cancelRecording}
          className="p-2 rounded-full bg-red-500"
        >
          <IoTrashOutline className="text-white" />
        </button>
      )}

      {isRecording && (
        <div className="sound-wave-bars">
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar hidden md:block"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>
      
      )}

      {inputValue.trim() ? (
        <button className="rounded-full p-2 bg-blue-500" onClick={handleSubmit}>
          <IoMdSend />
        </button>
      ) : (
        <>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full bg-blue-500`}
          >
            {isRecording ? <IoMdSend /> : <MdMic />}
          </button>
        </>
      )}
      </div>
    </div>
  );
}

export default ChatInput;
