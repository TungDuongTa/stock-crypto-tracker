"use client";
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SoicalSignInButton from "@/components/forms/SoicalSignInButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/zod/auth.schema";
export default function SignIn() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);
      if (result?.success) {
        router.replace("/");
        router.refresh();
      } else {
        const message = result.message ?? "Invalid email or password";
        setError("password", { type: "manual", message });
        toast.error(message);
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Sign-in failed. Please try again.", {
        description:
          error instanceof Error ? error.message : "Failed to sign in",
      });
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-400 mb-10">Welcome back</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          register={register}
          error={errors.email}
          // validation={{
          //   required: "Email is required",
          //   pattern: {
          //     value: /^\S+@\S+$/i,
          //     message: "Invalid email address",
          //   },
          // }}
        />
        <InputField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          register={register}
          error={errors.password}
          // validation={{
          //   required: "Password is required",
          //   pattern: {
          //     value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          //     message:
          //       "Password must be at least 8 characters long and contain letters and numbers",
          //   },
          // }}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 cursor-pointer bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-gray-950 font-medium text-base rounded-lg shadow-lg disabled:opacity-50 w-full mt-5"
        >
          {isSubmitting ? "Loging In ..." : "Log In"}
        </Button>
        <FooterLink
          text="Don't have an account"
          linkText="Sign up"
          href="/sign-up"
        />
        <SoicalSignInButton />
      </form>
    </>
  );
}
