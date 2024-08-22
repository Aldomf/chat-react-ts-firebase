import { useState, useRef, useEffect } from "react";
import { BiCheckDouble, BiPlay, BiPause } from "react-icons/bi";
import { cn } from "@/lib/utils";

interface AudioMessageProps {
  audioUrl?: string;
  date: string;
  isCurrentUser: boolean;
  photoUrl: string;
  isRead: boolean;
}

function AudioMessage({
  audioUrl,
  date,
  isCurrentUser,
  photoUrl,
  isRead,
}: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchDuration = (url: string) => {
      const player = new Audio(url);
      player.addEventListener("durationchange", function () {
        if (this.duration !== Infinity && this.duration > 0) {
          setDuration(this.duration);
        }
        player.remove();
      }, false);
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
      className={cn(
        "flex items-end py-2 md:px-6 space-y-2 w-full",
        {
          "justify-end": isCurrentUser,
        }
      )}
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
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlayPause}
              className="text-3xl focus:outline-none"
            >
              {isPlaying ? (
                <BiPause
                  className={isCurrentUser ? "text-white" : "text-[#2563EB]"}
                />
              ) : (
                <BiPlay
                  className={isCurrentUser ? "text-white" : "text-[#2563EB]"}
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
  );
}

export default AudioMessage;
