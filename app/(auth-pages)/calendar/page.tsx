"use client";

import dynamic from 'next/dynamic';

// Dynamically import Calendar component with SSR disabled
const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
  ssr: false,
  loading: () => <div className="w-full h-96 flex items-center justify-center">Loading calendar...</div>
});

// Import components
import SubjectForm from "@/components/subject-form/SubjectForm";
import EventForm from "@/components/event-form/EventForm";
import EditSubjectForm from "@/components/subject-form/EditSubjectForm";

// Calendar data with hardcoded dates
const calendarData = [
  {
    dateKey: "2024-05-20",
    date: new Date("2024-05-20"),
    title: "Mon, May 20",
    events: [
      { id: "1", title: "Team Meeting" },
      { id: "2", title: "Lunch with Client" },
      { id: "3", title: "Project Review" }
    ]
  },
  {
    dateKey: "2024-05-21",
    date: new Date("2024-05-21"),
    title: "Tue, May 21",
    events: [
      { id: "4", title: "Product Demo" }
    ]
  },
  {
    dateKey: "2024-05-22",
    date: new Date("2024-05-22"),
    title: "Wed, May 22",
    events: [
      { id: "5", title: "Training Session" },
      { id: "6", title: "Conference Call" }
    ]
  },
  {
    dateKey: "2024-05-23",
    date: new Date("2024-05-23"),
    title: "Thu, May 23",
    events: [
      { id: "7", title: "Workshop" }
    ]
  },
  {
    dateKey: "2024-05-24",
    date: new Date("2024-05-24"),
    title: "Fri, May 24",
    events: []
  }
];

export default function CalendarPage() {
  const handlePrevious = () => {
    console.log("Navigate to previous week");
    // Add navigation logic here
  };

  const handleNext = () => {
    console.log("Navigate to next week");
    // Add navigation logic here
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-4">
        <SubjectForm title="Add Subject" />
        <EditSubjectForm title="Edit Subject" />
        <EventForm title="Add One Off Event" />
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
