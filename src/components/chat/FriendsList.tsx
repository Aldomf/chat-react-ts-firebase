import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  
  function FriendsList() {
    return (
      <div className="h-[calc(100vh-130px)] overflow-y-auto">
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
                <p className="text-xs w-[80%] text-[#A6A3B8] font-medium">Card Content</p>
                <p className="text-[10px] w-[20%] text-[#A6A3B8]">45 min</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  export default FriendsList;
  