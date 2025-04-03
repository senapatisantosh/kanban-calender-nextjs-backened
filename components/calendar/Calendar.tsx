"use client";
import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import Day from "./Day";
import { Item } from "./SortableItem";
import NavigationArrows from "./NavigationArrows";

interface CalendarEvent {
  id: string;
  title: string;
}

interface CalendarDay {
  dateKey: string;
  date: Date;
  title: string;
  events: CalendarEvent[];
}

interface CalendarProps {
  calendarDays: CalendarDay[];
  onPrevious?: () => void;
  onNext?: () => void;
  title?: string;
}

const wrapperStyle = {
  display: "flex",
  flexDirection: "row" as const,
  width: "100%",
  overflowX: "auto" as const,
  gap: "12px",
  padding: "16px",
  background: "hsl(var(--background))",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)"
};

export default function Calendar({ calendarDays, onPrevious, onNext, title = "Calendar" }: CalendarProps) {
  // State to track event positions across days
  const [days, setDays] = useState(() => {
    const initialDays: { [key: string]: string[] } = {};
    const events: { [key: string]: CalendarEvent } = {};
    const dates: { [key: string]: Date } = {};
    const titles: { [key: string]: string } = {};
    
    // Initialize days and events from calendarDays
    calendarDays.forEach(day => {
      initialDays[day.dateKey] = day.events.map(event => event.id);
      dates[day.dateKey] = day.date;
      titles[day.dateKey] = day.title;
      
      // Store event details for lookup
      day.events.forEach(event => {
        events[event.id] = event;
      });
    });
    
    return { dayContainers: initialDays, allEvents: events, dates, titles };
  });
  
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Get titles for day containers
  const getDayTitle = (dateKey: string) => {
    return days.titles[dateKey];
  };

  // Get event content by ID
  const getEventContent = (id: string) => {
    return days.allEvents[id]?.title;
  };

  // Helper function to find which container an item belongs to
  function findContainer(id: string) {
    if (id in days.dayContainers) {
      return id;
    }

    return Object.keys(days.dayContainers).find((key) => days.dayContainers[key].includes(id));
  }

  function handleDragStart(event: any) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: any) {
    const { active, over } = event;
    
    if (!over) return;

    const { id } = active;
    const { id: overId } = over;

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setDays((prev) => {
      const activeItems = prev.dayContainers[activeContainer];
      const overItems = prev.dayContainers[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id);
      
      // Insert at end of over container by default
      let newIndex = overItems.length;
      
      if (overId in prev.allEvents) {
        // If dropping on a specific event, place after it
        const overIndex = overItems.indexOf(overId);
        newIndex = overIndex + 1;
      }

      // Create new state with the item moved to the new container
      return {
        ...prev,
        dayContainers: {
          ...prev.dayContainers,
          [activeContainer]: [
            ...prev.dayContainers[activeContainer].filter((item) => item !== id)
          ],
          [overContainer]: [
            ...prev.dayContainers[overContainer].slice(0, newIndex),
            activeItems[activeIndex],
            ...prev.dayContainers[overContainer].slice(newIndex)
          ]
        }
      };
    });
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const { id } = active;
    const { id: overId } = over;

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) {
      setActiveId(null);
      return;
    }

    if (activeContainer !== overContainer) {
      // Already handled in dragOver
      setActiveId(null);
      return;
    }

    // Same container, just reorder
    const activeIndex = days.dayContainers[activeContainer].indexOf(id);
    const overIndex = days.dayContainers[overContainer].indexOf(overId);

    if (activeIndex !== overIndex) {
      setDays((prev) => ({
        ...prev,
        dayContainers: {
          ...prev.dayContainers,
          [overContainer]: arrayMove(prev.dayContainers[overContainer], activeIndex, overIndex)
        }
      }));
    }

    setActiveId(null);
  }

  const activeEvent = activeId ? days.allEvents[activeId] : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {(onPrevious || onNext) && (
          <NavigationArrows onPrevious={onPrevious || (() => {})} onNext={onNext || (() => {})} />
        )}
      </div>
      <div style={wrapperStyle}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {Object.keys(days.dayContainers).map((dateKey) => (
            <Day 
              key={dateKey} 
              id={dateKey} 
              items={days.dayContainers[dateKey]} 
              title={getDayTitle(dateKey)}
              getItemContent={getEventContent}
            />
          ))}
          
          <DragOverlay>
            {activeId ? <Item id={activeId} content={activeEvent?.title} isDragOverlay={true} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
} 