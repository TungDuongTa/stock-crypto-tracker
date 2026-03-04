import Header from "@/components/stock/Header";
import { auth } from "@/lib/better-auth/auth";
import { email } from "better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? "",
  };
  return (
    <main className="min-h-screen text-gray-400">
      <Header user={user} />
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-10">
        {children}
      </div>
    </main>
  );
}
