import { useEffect, useRef } from "react";
import Message from "./Message";

function ChatMessages() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  return (
    <div 
      ref={scrollAreaRef}
      className="bg-[#DBEAFE] border-y border-[#DBEAFE] overflow-y-auto scrollable"
    >
      <Message
        date="right now"
        message="Lorem sss s s sssss sss"
        isCurrentUser={true}
        photoUrl="https://github.com/shadcn.png"
      />
      <Message
        date="right now"
        message="Lorem ipsum dolor, sit amet consectetur adipisicing elit. A voluptate sapiente, non minima corrupti quos repellendus, quod illum consequatur ea, aspernatur illo dolor necessitatibus recusandae! Doloremque, ullam? Vel officia delectus eius nesciunt. Nemo ex corrupti dolore dignissimos ipsum eaque architecto explicabo aliquam perspiciatis. Ratione expedita quidem exercitationem est quisquam cum!"
        isCurrentUser={false}
        photoUrl="https://github.com/shadcn.png"
      />
      <Message
        date="right now"
        message="Lorem ipsum dolor, sit amet consectetur adipisicing elit. A voluptate sapiente, non minima corrupti quos repellendus, quod illum consequatur ea, aspernatur illo dolor necessitatibus recusandae! Doloremque, ullam? Vel officia delectus eius nesciunt. Nemo ex corrupti dolore dignissimos ipsum eaque architecto explicabo aliquam perspiciatis. Ratione expedita quidem exercitationem est quisquam cum!"
        isCurrentUser={true}
        photoUrl="https://github.com/shadcn.png"
      />
      <Message
        date="right now"
        message="Lorem sss s s sssss sss"
        isCurrentUser={false}
        photoUrl="https://github.com/shadcn.png"
      />
      <Message
        date="right now"
        message="Lorem sss s s sssss sss"
        isCurrentUser={true}
        photoUrl="https://github.com/shadcn.png"
      />
      <Message
        date="right now"
        message="Lorem sss s s sssss sss"
        isCurrentUser={true}
        photoUrl="https://github.com/shadcn.png"
      />
    </div>
  );
}

export default ChatMessages;
