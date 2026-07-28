import React, { useState } from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Compass, 
  Utensils, 
  Navigation, 
  Home, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

const TYPE_ICONS = {
  activity: <Compass size={18} />,
  food: <Utensils size={18} />,
  transport: <Navigation size={18} />,
  lodging: <Home size={18} />
};

function StopCard({ 
  stop, 
  isFirst, 
  isLast, 
  onRemove, 
  onMoveUp, 
  onMoveDown 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const type = stop.type || "activity";
  const icon = TYPE_ICONS[type] || TYPE_ICONS.activity;

  return (
    <div className="stop-card">
      {/* Category Indicator Icon */}
      <div className={`stop-type-icon-wrapper stop-type-${type}`}>
        {icon}
      </div>

      {/* Stop Information details */}
      <div className="stop-details">
        <div className="stop-meta-line">
          <span className="stop-time">{stop.time}</span>
          <h4 className="stop-name">{stop.name}</h4>
        </div>

        {/* Expandable Notes section */}
        {stop.notes && (
          <>
            {isExpanded && (
              <p className="stop-notes animate-fade-in">
                {stop.notes}
              </p>
            )}
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="stop-notes-toggle"
              type="button"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} /> Hide details
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> Show details
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Controls for removal and reordering */}
      <div className="stop-controls">
        <div className="order-arrows">
          <button
            type="button"
            className="arrow-btn"
            disabled={isFirst}
            onClick={onMoveUp}
            title="Move stop up"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            className="arrow-btn"
            disabled={isLast}
            onClick={onMoveDown}
            title="Move stop down"
          >
            <ArrowDown size={16} />
          </button>
        </div>
        
        <button
          type="button"
          className="delete-btn"
          onClick={onRemove}
          title="Remove stop"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default StopCard;
