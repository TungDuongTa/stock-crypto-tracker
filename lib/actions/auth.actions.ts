"use server";

import { auth } from "../better-auth/auth";
import { inngest } from "@/lib/inngest/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signUpWithEmail = async (data: SignUpFormData) => {
  try {
    //sign-up logic here
    const response = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: data.password,
        name: data.fullName,
      },
    });
    if (response) {
      await inngest.send({
        name: "app/user.created",
        data: {
          email: data.email,
          name: data.fullName,
          country: data.country,
          investmentGoals: data.investmentGoals,
          riskTolerance: data.riskTolerance,
          preferredIndustry: data.preferredIndustry,
        },
      });
    }
    return { success: true, message: "Sign-up successful" };
  } catch (error) {
    console.error("Sign-up error:", error);
    return { success: false, message: "Sign-up failed" };
  }
};

export const signOut = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("Sign-out error:", error);
    return { success: false, message: "Sign-out failed" };
  }
};

export const signInWithEmail = async (data: SignInFormData) => {
  try {
    //sign-in logic here
    const response = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
      },
    });
    return { success: true, message: "Sign-in successful" };
  } catch (error) {
    console.error("Sign-in error:", error);
    return { success: false, message: "Sign-in failed" };
  }
};
export const signInSocial = async (provider) => {
  try {
    const response = await auth.api.signInSocial({
      body: {
        provider: provider,
        callbackURL: `/`,
      },
    });

    if (response.url) {
      redirect(response.url);
    }

    return { success: true, message: "Successfully initiated Google sign-in" };
  } catch (error) {
    // Re-throw redirect errors so they work properly
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Google auth error:", error);
    return { success: false, message: "Failed to get Google auth URL" };
  }
};
