"use client";

import { Button } from "@/components/ui/button";
import { signInSocial } from "@/lib/actions/auth.actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type SoicalSignInButtonProps = {
  isSubmitting?: boolean;
};

export default function SoicalSignInButton({
  isSubmitting = false,
}: SoicalSignInButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // The signInSocial action will handle the redirect
      // No need to catch or handle anything here
      await signInSocial({ provider: "google" });
    } catch (error) {
      // Only handle actual errors, not redirect
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return; // This is expected behavior
      }
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed");
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading || isSubmitting}
      className="w-full h-12 cursor-pointer bg-linear-to-b from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-gray-200 font-medium text-base rounded-lg shadow-lg disabled:opacity-50r"
    >
      {isLoading ? (
        <>
          <Image
            src="/assets/icons/google-icon.svg"
            width={24}
            height={24}
            alt="Google Icon"
            className="w-4 h-4"
          />
          Signing in...
        </>
      ) : (
        <>
          <Image
            src="/assets/icons/google-icon.svg"
            width={24}
            height={24}
            alt="Google Icon"
            className="w-4 h-4"
          />
          Sign in with Google
        </>
      )}
    </Button>
  );
}
