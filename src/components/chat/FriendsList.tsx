import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { ScrollArea } from "@/components/ui/scroll-area"

  
  function FriendsList() {
    return (
      <ScrollArea className="h-[calc(100vh-130px)] overflow-y-auto">
        {Array.from({ length: 15 }).map((_, index) => (
          <Card
            key={index}
            className="flex py-2 rounded-none hover:bg-[#F1F5F9] cursor-pointer border-none shadow-none"
          >
            <div className="flex items-center justify-center py-0 w-[35%]">
              <Avatar className="rounded-md w-[60%] h-full">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="py-0 w-[75%] space-y-2">
              <CardHeader className="h-fit py-0 px-0">
                <CardTitle className="text-lg text-[#64748B]">Aldo Miralles</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center py-0 px-0">
                <p className="text-xs w-60 text-[#A6A3B8] font-medium truncate mr-2">Card Content Lorem ipsum, dolor sit amet consectetur adipisicing elit. Commodi, ea inventore quam tempora corporis perferendis provident nam vel dolores enim tempore reprehenderit ex eos minima nihil quisquam animi repellat omnis.</p>
                <p className="text-[10px] w-[20%] text-[#A6A3B8]">45 min</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </ScrollArea>
    );
  }
  
  export default FriendsList;
  