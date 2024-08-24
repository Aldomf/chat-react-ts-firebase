import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { searchFriendSchema as formSchema } from "@/lib/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth, useFirestore } from "reactfire";
import { RoomDB, UserRoom } from "@/schemas/firestore-schema";
import { IoSearchOutline } from "react-icons/io5";

function SearchContact() {
  const auth = useAuth();
  const db = useFirestore();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (auth.currentUser?.email === values.email) {
        form.setError("email", {
          type: "manual",
          message: "You can't add yourself as a friend",
        });
        return;
      }

      const q = query(
        collection(db, "users"),
        where("email", "==", values.email)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        form.setError("email", {
          type: "manual",
          message: "User not found",
        });
        return;
      }

      const friend = querySnapshot.docs[0].data();

      // check if user is already added
      const q2 = query(
        collection(db, "users"),
        where("uid", "==", auth.currentUser!.uid),
        where("friends", "array-contains", friend.uid)
      );

      const querySnapshot2 = await getDocs(q2);

      if (!querySnapshot2.empty) {
        form.setError("email", {
          type: "manual",
          message: "User already added",
        });
        return;
      }

      // create a new room
      const newRoomDB: RoomDB = {
        messages: [],
        users: [auth.currentUser?.uid, friend.uid],
      };

      const newRoomRef = await addDoc(collection(db, "rooms"), newRoomDB);

      // add the room to both users
      const currentUserRoom: UserRoom = {
        roomid: newRoomRef.id,
        lastMessage: "",
        timestamp: "",
        friendId: friend.uid,
      };

      const friendRoom: UserRoom = {
        roomid: newRoomRef.id,
        lastMessage: "",
        timestamp: "",
        friendId: auth.currentUser!.uid,
      };

      const currentUserRoomRef = doc(
        collection(db, "users"),
        auth.currentUser!.uid
      );
      const friendRoomRef = doc(collection(db, "users"), friend.uid);

      await updateDoc(currentUserRoomRef, {
        friends: arrayUnion(friend.uid),
        rooms: arrayUnion(currentUserRoom),
      });
      await updateDoc(friendRoomRef, {
        friends: arrayUnion(auth.currentUser!.uid),
        rooms: arrayUnion(friendRoom),
      });

      form.reset();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="py-4 px-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="email"
                      placeholder="Search contact by email"
                      className="rounded-3xl bg-[#E2E8F0] placeholder:text-[#A6A3B8] dark:text-gray-400 pl-4 pr-12 dark:bg-gray-800"
                    />
                    <Button
                      type="submit"
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-r-full w-10 dark:bg-gray-800"
                    >
                      <IoSearchOutline className="text-[#A6A3B8]" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

export default SearchContact;
