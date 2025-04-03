"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ItemProps {
  id: string;
  content?: string;
  isDragOverlay?: boolean;
}

export function Item({ id, content, isDragOverlay = false }: ItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const itemStyle = {
    padding: "12px",
    margin: "8px 0",
    backgroundColor: "hsl(var(--primary) / 0.1)",
    borderRadius: "6px",
    cursor: "pointer",
    border: "1px solid hsl(var(--primary) / 0.2)",
    color: "hsl(var(--primary))",
    fontWeight: "medium",
    userSelect: "none" as const,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    position: "relative" as const
  };

  const deleteIconStyle = {
    opacity: isHovered && !isDragOverlay ? 1 : 0,
    transition: "opacity 0.2s ease",
    cursor: isDragOverlay ? "default" : "pointer",
    marginLeft: "8px",
    color: "hsl(var(--destructive))",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    visibility: isDragOverlay ? "hidden" as const : "visible" as const,
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This doesn't need to do anything right now per requirements
    console.log(`Delete clicked for event ${id}`);
  };

  return (
    <div 
      style={itemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {content || `Event ${id}`}
      </div>
      <div style={deleteIconStyle} onClick={handleDeleteClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </div>
    </div>
  );
}

export default function SortableItem({ id, content }: ItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "100%",
    opacity: isDragging ? 0.4 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item id={id} content={content} />
    </div>
  );
} 