import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";

type EventData = {
  event_id: string;
  event_type: string;
  event_title: string;
  event_date: string;
  daily_order_index: number;
};

type EventDataSlim = {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  daily_order_index: number;
};

type TransformedEvent = {
  dateKey: string;
  date: Date;
  title: string;
  events: EventDataSlim[];
};

function TransformEventData(
  events: EventData[],
  weekStartDate: Date,
  weekEndDate: Date
): TransformedEvent[] {
  const grouped = _.groupBy(events, "event_date");

  const results: TransformedEvent[] = [];

  for (
    let date = new Date(weekStartDate);
    date <= weekEndDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateKey = date.toISOString().split("T")[0];
    const eventList = grouped[dateKey] || [];

    results.push({
      dateKey: dateKey,
      date: new Date(date),
      title: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
      }),
      events: eventList
        .sort((a, b) => a.daily_order_index - b.daily_order_index)
        .map((event) => ({
          id: event.event_id,
          title: event.event_title,
          event_type: event.event_type,
          event_date: event.event_date,
          daily_order_index: event.daily_order_index,
        })),
    });
  }

  return results;
}

export async function GET(req: NextRequest) {
  const user_id = req.headers.get("x-user-id");
  const { searchParams } = req.nextUrl;
  const weekStartDate = searchParams.get("weekStartDate");
  const weekEndDate = searchParams.get("weekEndDate");

  if (!weekStartDate || !weekEndDate) {
    return NextResponse.json(
      { error: "Missing weekStartDate or weekEndDate parameter" },
      { status: 400 }
    );
  }

  const startDate = new Date(weekStartDate);
  const endDate = new Date(weekEndDate);
  const body = { user_id, startDate, endDate };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_user_events_with_titles", {
    data: body,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const transformEventData = TransformEventData(data, startDate, endDate);

  return NextResponse.json(transformEventData);
}

export async function POST(req: NextRequest) {
  const { eventId, newDate, desiredIndex } = await req.json();

  if (!eventId || !newDate || !desiredIndex) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const body = {
    event_id: eventId,
    new_date: newDate,
    desired_index: desiredIndex,
  };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("move_event", {
    data: body,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
