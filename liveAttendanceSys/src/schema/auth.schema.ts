import * as z from "zod";

export const SigninSchema = z.object({
  email: z.email(),
  password: z.string()
})

export const SignupSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(6),
  role: z.string()
})
