import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user_id = req.headers.get("x-user-id");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("one_offs")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const user_id = req.headers.get("x-user-id");
  const { title, schedule_date } = await req.json();
  const body = { user_id, title, schedule_date };
  if (!title || !schedule_date) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("insert_one_off", {
    data: body,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
