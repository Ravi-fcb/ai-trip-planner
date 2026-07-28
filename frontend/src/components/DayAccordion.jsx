import React from "react";
import { ChevronDown } from "lucide-react";
import StopCard from "./StopCard";

function DayAccordion({ 
  dayData, 
  isExpanded, 
  onToggle, 
  onRemoveStop, 
  onMoveStop 
}) {
  const stops = dayData.stops || [];

  return (
    <div className={`day-accordion-item ${isExpanded ? "expanded" : ""}`}>
      {/* Accordion Trigger Header */}
      <button 
        type="button" 
        className="day-header-trigger"
        onClick={onToggle}
      >
        <div className="day-title-info">
          <div className="day-number-badge">{dayData.day}</div>
          <span className="day-title-text">{dayData.title}</span>
        </div>
        <div className="day-header-right">
          <span className="stops-count">
            {stops.length} {stops.length === 1 ? "stop" : "stops"}
          </span>
          <ChevronDown size={20} className="chevron-icon" />
        </div>
      </button>

      {/* Accordion Content Panel */}
      {isExpanded && (
        <div className="day-content-panel">
          {stops.length === 0 ? (
            <div className="empty-day-state">
              No stops planned for this day.
            </div>
          ) : (
            <div className="stop-card-list">
              {stops.map((stop, index) => (
                <StopCard
                  key={stop.id || index}
                  stop={stop}
                  isFirst={index === 0}
                  isLast={index === stops.length - 1}
                  onRemove={() => onRemoveStop(dayData.day, index)}
                  onMoveUp={() => onMoveStop(dayData.day, index, index - 1)}
                  onMoveDown={() => onMoveStop(dayData.day, index, index + 1)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DayAccordion;
