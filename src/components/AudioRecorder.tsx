import React, { useState, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";

interface AudioRecorderProps {
    onAudioRecorded: (audioBlob: Blob) => void;
  }

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      onAudioRecorded(audioBlob);
      audioChunksRef.current = [];
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        <FaMicrophone className={`w-10 h-10 ${isRecording ? "text-red-500" : ""}`} />
      </button>
    </div>
  );
};

export default AudioRecorder;
