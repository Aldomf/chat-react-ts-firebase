import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

function ChatHeader() {
  return (
    <div className="flex justify-between items-center px-6">
      <Card className="flex py-2 rounded-none border-none shadow-none">
        <div className="flex items-center justify-center py-0">
          <Avatar className="rounded-md w-14 h-14 mr-2">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div className="py-0 w-[75%] space-y-2">
          <CardHeader className="h-fit py-0 px-0">
            <CardTitle className="text-lg text-[#64748B]">
              Aldo Miralles
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center py-0 px-0">
            <p className="text-xs w-60 text-[#A6A3B8] font-medium truncate mr-2">
              Active
            </p>
          </CardContent>
        </div>
      </Card>
      <div className="flex items-center">
        <Button className="">Close chat</Button>
      </div>
    </div>
  );
}

export default ChatHeader;
