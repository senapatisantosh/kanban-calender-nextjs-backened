"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

interface DayProps {
  id: string;
  items: string[];
  title?: string;
  getItemContent?: (id: string) => string | undefined;
}

export default function Day({ id, items, title, getItemContent }: DayProps) {
  const { setNodeRef } = useDroppable({
    id
  });

  const dayStyle = {
    flex: 1,
    minWidth: "200px",
    padding: "16px",
    margin: "4px",
    backgroundColor: "hsl(var(--card))",
    borderRadius: "8px",
    minHeight: "400px",
    maxHeight: "70vh",
    display: "flex",
    flexDirection: "column" as const,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    border: "1px solid hsl(var(--border))"
  };

  const headerStyle = {
    marginBottom: "12px",
    fontWeight: "bold",
    textAlign: "center" as const,
    padding: "4px 0",
    borderBottom: "1px solid hsl(var(--border) / 0.5)",
    color: "hsl(var(--foreground))"
  };

  const contentStyle = {
    flex: 1,
    overflowY: "auto" as const
  };

  return (
    <div style={dayStyle}>
      <div style={headerStyle}>{title || id}</div>
      <SortableContext
        id={id}
        items={items}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} style={contentStyle}>
          {items.map((id) => (
            <SortableItem 
              key={id} 
              id={id} 
              content={getItemContent ? getItemContent(id) : undefined} 
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
} 