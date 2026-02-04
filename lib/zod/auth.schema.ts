import { z } from "zod";
import {
  INVESTMENT_GOALS,
  PREFERRED_INDUSTRIES,
  RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),

  email: z.string().min(1, "Email is required").email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
      "Password must contain letters and numbers",
    ),

  country: z
    .string()
    .min(1, "Please select your country")
    .length(2, "Invalid country code"),

  investmentGoals: z.string().min(1, "Please select your investment goals"),

  riskTolerance: z.string().min(1, "Please select your risk tolerance"),

  preferredIndustry: z.string().min(1, "Please select your preferred industry"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),

  password: z.string().min(1, "Password is required"),
  // .min(8, "Password must be at least 8 characters")
  // .regex(
  //   /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
  //   "Password must contain letters and numbers",
  // ),
});

export type SignInFormData = z.infer<typeof signInSchema>;
