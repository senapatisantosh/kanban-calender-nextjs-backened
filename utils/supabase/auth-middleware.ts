import { NextRequest, NextResponse } from "next/server";
import { createClient } from "./server";

export async function varifyToken(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });

  return NextResponse.next();
}
