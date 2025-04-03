import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").select("*");

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { name, teaching_days, lesson_count } = await req.json();
  const body = { name, teaching_days, lesson_count };
  if (!name || !teaching_days || !lesson_count) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("insert_subject", {
    data: body,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  console.log(error);
  return NextResponse.json(data, { status: 201 });
}
