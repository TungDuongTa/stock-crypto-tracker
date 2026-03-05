import { auth } from "@/lib/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const { POST, GET } = toNextJsHandler(auth);
