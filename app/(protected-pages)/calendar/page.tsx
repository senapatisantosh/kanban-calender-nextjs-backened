"use client";

import dynamic from "next/dynamic";
import moment from "moment-timezone";

// Dynamically import Calendar component with SSR disabled
const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center">
      Loading calendar...
    </div>
  ),
});

// Import components
import SubjectForm, {
  SubjectFormData,
} from "@/components/subject-form/SubjectForm";
import EventForm, {
  OneOffEventFormData,
} from "@/components/event-form/EventForm";
import EditSubjectForm from "@/components/subject-form/EditSubjectForm";
import { useEffect, useState } from "react";
import axiosClient from "@/utils/axios/axios-client";
import { MoveEvent } from "@/components/calendar/Calendar";

export default function CalendarPage() {
  const getWeekBoundaries = (weekStartDate: string) => {
    const weekStart = moment.utc(weekStartDate).startOf("day");
    const weekEnd = weekStart.clone().add(4, "days").endOf("day");

    return {
      weekStart: weekStart.format("YYYY-MM-DD"),
      weekEnd: weekEnd.format("YYYY-MM-DD"),
    };
  };

  const getMondayOfCurrentWeek = (date: Date): Date => {
    const givenDate = moment.utc(date);
    const dayOfWeek = givenDate.isoWeekday();
    const monday = givenDate.subtract(dayOfWeek - 1, "days").startOf("day");
    return monday.toDate();
  };

  const [weekStartDate, setWeekStartDate] = useState<Date>(
    getMondayOfCurrentWeek(new Date())
  );
  const [calendarData, setCalendarData] = useState<TransformedEvent[]>([]);
  const [subjectFormData, setSubjectFormData] = useState<SubjectFormData>();
  const [oneOffEventFormData, setoneOffEventFormData] =
    useState<OneOffEventFormData>();
  const [onMoveEvent, setOnMoveEvent] = useState<MoveEvent>();
  const [loadEventData, setLoadEventData] = useState<boolean>(false);

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

  useEffect(() => {
    fetchEventsForWeek(weekStartDate);
  }, [weekStartDate, loadEventData]);

  const fetchEventsForWeek = async (weekStartDate: Date) => {
    try {
      const { weekStart, weekEnd } = getWeekBoundaries(
        weekStartDate.toISOString()
      );
      const { data } = await axiosClient.get<TransformedEvent[]>(
        `/events?weekStartDate=${weekStart}&weekEndDate=${weekEnd}`
      );

      if (!data) throw new Error("Failed to fetch events");

      setCalendarData([...data]);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (subjectFormData) {
      addSubject(subjectFormData);
    }
  }, [subjectFormData]);

  const addSubject = async (subjectFormData: SubjectFormData) => {
    try {
      const { data } = await axiosClient.post<string>(
        "/subjects",
        subjectFormData
      );
      if (!data) throw new Error("Failed to add Subject");
      setLoadEventData((prev) => !prev);
    } catch (error) {
      console.error("Error adding Subject:", error);
    }
  };

  useEffect(() => {
    if (oneOffEventFormData) {
      addOneOffEvent(oneOffEventFormData);
    }
  }, [oneOffEventFormData]);

  const addOneOffEvent = async (oneOffEventFormData: OneOffEventFormData) => {
    try {
      const { data } = await axiosClient.post<string>(
        "/one-offs",
        oneOffEventFormData
      );
      if (!data) throw new Error("Failed to add One Off event");
      setLoadEventData((prev) => !prev);
    } catch (error) {
      console.error("Error adding One Off event:", error);
    }
  };

  useEffect(() => {
    if (onMoveEvent) {
      executeOnMoveEvent(onMoveEvent);
    }
  }, [onMoveEvent]);

  const executeOnMoveEvent = async (onMoveEvent: MoveEvent) => {
    try {
      const { data } = await axiosClient.post("/events", onMoveEvent);
      setLoadEventData((prev) => !prev);
    } catch (error) {
      console.error("Error executing on move event:", error);
    }
  };

  const handlePrevious = () => {
    setWeekStartDate((previous) => {
      const prevWeek = new Date(previous);
      prevWeek.setDate(prevWeek.getDate() - 7);
      return prevWeek;
    });
  };

  const handleNext = () => {
    setWeekStartDate((next) => {
      const nextWeek = new Date(next);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    });
  };

  const handleAddSubject = (formData: SubjectFormData) => {
    setSubjectFormData(formData);
  };

  const handleAddOneOffEvent = (formData: OneOffEventFormData) => {
    setoneOffEventFormData(formData);
  };

  const handleOnMove = (data: MoveEvent) => {
    setOnMoveEvent(data);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-4">
        <SubjectForm title="Add Subject" onAddSubject={handleAddSubject} />
        <EditSubjectForm title="Edit Subject" />
        <EventForm
          title="Add One Off Event"
          onAddOneOffEvent={handleAddOneOffEvent}
        />
      </div>

      <div className="mt-8">
        <Calendar
          calendarDays={calendarData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onMoveEvent={handleOnMove}
          title="Calendar"
        />
      </div>
    </div>
  );
}
