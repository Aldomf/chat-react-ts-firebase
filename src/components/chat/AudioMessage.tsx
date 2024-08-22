import { useState, useRef, useEffect } from "react";
import { BiCheckDouble, BiPlay, BiPause } from "react-icons/bi";
import { cn } from "@/lib/utils";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useFirestore } from "reactfire";
import { useChatStore } from "@/store/chat-store";
import { Message } from "@/schemas/firestore-schema";
import { MdMic } from "react-icons/md";

interface AudioMessageProps {
  audioUrl?: string;
  date: string;
  isCurrentUser: boolean;
  photoUrl: string;
  isRead: boolean;
  messageId: string; // Add this to identify the message
  isListened: boolean;
}

function AudioMessage({
  audioUrl,
  date,
  isCurrentUser,
  photoUrl,
  isRead,
  messageId,
  isListened,
}: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const db = useFirestore();
  const { friend } = useChatStore();
  const roomId = friend!.roomid;

  useEffect(() => {
    const fetchDuration = (url: string) => {
      const player = new Audio(url);
      player.addEventListener(
        "durationchange",
        function () {
          if (this.duration !== Infinity && this.duration > 0) {
            setDuration(this.duration);
          }
          player.remove();
        },
        false
      );
      player.load();
      player.currentTime = 24 * 60 * 60; // Fake big time
      player.volume = 0;
      player.play().catch((e) => console.error("Playback error:", e));
    };

    if (audioUrl) {
      fetchDuration(audioUrl);
    }

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio) {
        if (!isNaN(audio.currentTime) && isFinite(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / audio.duration) * 100 || 0);
        }
      }
    };

    const handleEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    if (audio) {
      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", handleEnd);

      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("ended", handleEnd);
      };
    }
  }, [audioUrl]);

  useEffect(() => {
    if (isPlaying) {
      markAsListened(messageId, roomId);
    }
  }, [isPlaying]);

  const markAsListened = async (messageId: string, roomId: string) => {
    if (!messageId) return;

    try {
      const roomRef = doc(db, "rooms", roomId);
      const roomDoc = await getDoc(roomRef);

      if (roomDoc.exists()) {
        const currentMessages = roomDoc.data() as { messages: Message[] };
        const updatedMessages = currentMessages.messages.map(
          (message: Message) => {
            if (
              message.isListened !== true &&
              message.uid === friend!.uid &&
              message.messageId === messageId
            ) {
              return { ...message, isListened: true };
            }
            return message;
          }
        );

        // Only update if there is a change
        if (
          JSON.stringify(currentMessages) !== JSON.stringify(updatedMessages)
        ) {
          await updateDoc(roomRef, {
            messages: updatedMessages,
          });
        }
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    if (!isNaN(time) && isFinite(time)) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    return "0:00";
  };

  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const progressBar = event.currentTarget;
      const clickX = event.nativeEvent.offsetX;
      const progressBarWidth = progressBar.clientWidth;
      const newProgress = (clickX / progressBarWidth) * 100;
      setProgress(newProgress);
      const newTime = (newProgress / 100) * audio.duration;
      setCurrentTime(newTime);
      audio.currentTime = newTime;
    }
  };

  return (
    <div
      className={cn("flex items-end py-2 md:px-6 space-y-2 w-full", {
        "justify-end": isCurrentUser,
      })}
    >
      {!isCurrentUser && (
        <img
          src={photoUrl || ""}
          alt="chat-audio"
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div
        className={cn(
          "flex items-center space-x-2 bg-white rounded-lg p-2 w-[70%] md:w-[30%]",
          {
            "bg-[#2563EB]": isCurrentUser,
            "text-white": isCurrentUser,
          }
        )}
      >
        <div className="flex items-center w-full">
          <MdMic
            className={
              isListened ? "text-green-500 size-8" : "text-gray-400 size-8"
            }
          />
          <div className="w-full">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePlayPause}
                className="text-3xl focus:outline-none"
              >
                {isPlaying ? (
                  <BiPause
                    className={`${
                      isCurrentUser ? "text-white" : "text-[#2563EB]"
                    } ${isListened && "text-green-500"}`}
                  />
                ) : (
                  <BiPlay
                    className={`${
                      isCurrentUser ? "text-white" : "text-[#2563EB]"
                    } ${isListened && "text-green-500"}`}
                  />
                )}
              </button>

              <div className="flex flex-col w-full">
                <div
                  className="relative h-1 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                  onClick={handleProgressBarClick}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <audio ref={audioRef} src={audioUrl} className="hidden" />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-[#A6A3B8] pl-5">
              <span>
                {isPlaying ? formatTime(currentTime) : formatTime(duration)}
              </span>
              <div className="flex items-center">
                <span>{date}</span>
                {isCurrentUser && (
                  <BiCheckDouble
                    className={cn("size-4", {
                      "text-green-500": isRead,
                      "text-gray-400": !isRead,
                    })}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioMessage;
