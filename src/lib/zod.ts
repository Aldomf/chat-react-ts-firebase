import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerFormSchema = z
  .object({
    photoURL: z
      .instanceof(File)
      .refine((file) => file.size <= 2 * 1024 * 1024, {
        message: "Image size must not exceed 2MB",
      })
      .refine((file) => file.type.startsWith("image/"), {
        message: "Please upload a valid image file",
      }),
    username: z.string().min(1, "Username must be at least 1 character"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ['confirmPassword'], // This ensures the error message appears on the correct field
  });

  export const searchFriendSchema = z.object({
    username: z.string().min(1, "Username must be at least 1 characters"),
  });
