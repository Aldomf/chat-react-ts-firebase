import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerFormSchema } from "@/lib/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth, useFirestore, useStorage } from "reactfire";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { UserDB } from "@/schemas/firestore-schema";

function Register() {
  const auth = useAuth();
  const storage = useStorage();
  const db = useFirestore();

  // 1. Define your form.
  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      photoURL: undefined,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof registerFormSchema>) {
    try {
      // create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      // upload photo
      const storageRef = ref(storage, `users/${userCredential.user.uid}`);
      await uploadBytes(storageRef, values.photoURL);

      // download photo
      const downloadURL = await getDownloadURL(storageRef);

      // update profile
      await updateProfile(userCredential.user, {
        displayName: values.username,
        photoURL: downloadURL,
      });

      // reload user
      await auth.currentUser?.reload();

      // set the data to the firebase storage
      const userDB: UserDB = {
        diesplayName: values.username,
        email: values.email,
        photoURL: downloadURL,
        uid: userCredential.user.uid,
        friends: [],
        rooms: [],
      }

      const userRef = doc(db, "users", userCredential.user.uid);

      await setDoc( userRef, userDB);

    } catch (error) {
      if (error instanceof Error) {
        // Handle specific Firebase error messages
        if (error.message.includes("auth/email-already-in-use")) {
          form.setError("email", {
            type: "manual",
            message: "Email already in use",
          });
        } else if (error.message.includes("auth/weak-password")) {
          form.setError("password", {
            type: "manual",
            message: "Password should be at least 6 characters",
          });
        } else {
          // Handle other errors
          form.setError("root", {
            type: "manual",
            message: "An unexpected error occurred. Please try again.",
          });
        }
        console.error("Error creating user:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    console.log(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Welcome back, please register to your account!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@domain.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="*******" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          field.onChange(e.target.files[0]);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Register</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default Register;
