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
// Calendar data with hardcoded dates
// const calendarData = [
//   {
//     dateKey: "2024-05-20",
//     date: new Date("2024-05-20"),
//     title: "Mon, May 20",
//     events: [
//       { id: "1", title: "Team Meeting" },
//       { id: "2", title: "Lunch with Client" },
//       { id: "3", title: "Project Review" },
//     ],
//   },
//   {
//     dateKey: "2024-05-21",
//     date: new Date("2024-05-21"),
//     title: "Tue, May 21",
//     events: [{ id: "4", title: "Product Demo" }],
//   },
//   {
//     dateKey: "2024-05-22",
//     date: new Date("2024-05-22"),
//     title: "Wed, May 22",
//     events: [
//       { id: "5", title: "Training Session" },
//       { id: "6", title: "Conference Call" },
//     ],
//   },
//   {
//     dateKey: "2024-05-23",
//     date: new Date("2024-05-23"),
//     title: "Thu, May 23",
//     events: [{ id: "7", title: "Workshop" }],
//   },
//   {
//     dateKey: "2024-05-24",
//     date: new Date("2024-05-24"),
//     title: "Fri, May 24",
//     events: [],
//   },
// ];

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
      console.log(weekStartDate, weekStart, weekEnd);
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
      setLoadEventData(true);
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
      setLoadEventData(true);
    } catch (error) {
      console.error("Error adding One Off event:", error);
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

  const onAddSubject = (formData: SubjectFormData) => {
    setSubjectFormData(formData);
  };

  const onAddOneOffEvent = (formData: OneOffEventFormData) => {
    setoneOffEventFormData(formData);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-4">
        <SubjectForm title="Add Subject" onAddSubject={onAddSubject} />
        <EditSubjectForm title="Edit Subject" />
        <EventForm
          title="Add One Off Event"
          onAddOneOffEvent={onAddOneOffEvent}
        />
      </div>

      <div className="mt-8">
        <Calendar
          calendarDays={calendarData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          title="Calendar"
        />
      </div>
    </div>
  );
}
