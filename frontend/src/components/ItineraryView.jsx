import React, { useState } from "react";
import { Compass, RotateCcw, Clipboard, Sparkles, Bookmark, Check } from "lucide-react";
import DayAccordion from "./DayAccordion";

function ItineraryView({ 
  itinerary, 
  activeTripId,
  onRemoveStop, 
  onMoveStop, 
  onReset,
  onRefine,
  refineLoading,
  onSave
}) {
  const [expandedDays, setExpandedDays] = useState({ 1: true });
  const [refinementPrompt, setRefinementPrompt] = useState("");

  const toggleDay = (dayNumber) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  const handleRefineSubmit = (e) => {
    e.preventDefault();
    if (refinementPrompt.trim() && !refineLoading) {
      onRefine(refinementPrompt.trim());
      setRefinementPrompt("");
    }
  };

  const handleExportText = () => {
    if (!itinerary) return;

    let text = `✈️ ITINERARY: ${itinerary.destination.toUpperCase()}\n`;
    text += `📅 Duration: ${itinerary.durationDays} Days\n\n`;

    itinerary.days.forEach((dayData) => {
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `☀️ DAY ${dayData.day}: ${dayData.title}\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      if (!dayData.stops || dayData.stops.length === 0) {
        text += `  No stops planned.\n`;
      } else {
        dayData.stops.forEach((stop) => {
          text += `▪️ [${stop.time}] ${stop.name} (${stop.type || "activity"})\n`;
          if (stop.notes) {
            text += `  Notes: ${stop.notes}\n`;
          }
          text += `\n`;
        });
      }
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    alert("Itinerary copied to clipboard as clean text! 📋");
  };

  const totalStops = (itinerary?.days || []).reduce(
    (acc, day) => acc + (day.stops || []).length, 
    0
  );

  return (
    <div className="glass-card" style={{ padding: "2rem" }}>
      {/* Header Info */}
      <div className="itinerary-header">
        <div>
          <span className="dest-badge">
            <Compass size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            {itinerary.destination}
          </span>
          <div className="trip-meta">
            <span><strong>{itinerary.durationDays}</strong> days itinerary</span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span><strong>{totalStops}</strong> total stops</span>
          </div>
        </div>

        {/* Actions */}
        <div className="itinerary-actions">
          {/* Save Button */}
          {activeTripId ? (
            <button 
              type="button" 
              className="action-btn-outline saved-status-badge"
              disabled
              title="Saved to Dashboard"
            >
              <Check size={16} style={{ color: "var(--color-success)" }} />
              <span style={{ color: "var(--color-success)" }}>Saved</span>
            </button>
          ) : (
            <button 
              type="button" 
              className="action-btn-save" 
              onClick={onSave}
              title="Save to Dashboard history"
              disabled={refineLoading}
            >
              <Bookmark size={16} />
              <span>Save Itinerary</span>
            </button>
          )}

          <button 
            type="button" 
            className="action-btn-outline" 
            onClick={handleExportText}
            title="Copy as plain text"
            disabled={refineLoading}
          >
            <Clipboard size={16} />
            <span>Copy Text</span>
          </button>
          
          <button 
            type="button" 
            className="action-btn-outline" 
            onClick={onReset}
            title={activeTripId ? "Close this itinerary" : "Start a new trip"}
            disabled={refineLoading}
          >
            <RotateCcw size={16} />
            <span>{activeTripId ? "Close" : "Start Over"}</span>
          </button>
        </div>
      </div>

      {/* Accordion Days List */}
      <div className="day-accordion-list">
        {itinerary.days.map((dayData) => (
          <DayAccordion
            key={dayData.day}
            dayData={dayData}
            isExpanded={!!expandedDays[dayData.day]}
            onToggle={() => toggleDay(dayData.day)}
            onRemoveStop={onRemoveStop}
            onMoveStop={onMoveStop}
          />
        ))}
      </div>

      {/* Refinement Chat Section */}
      {onRefine && (
        <div className="refine-section">
          <p className="refine-desc">
            Want to refine your trip? Describe what you'd like to change (e.g., <em>"Make Day 2 more relaxed"</em>, <em>"Add a sushi place on Day 3"</em>, or <em>"Suggest hotels for lodging"</em>).
          </p>
          <form onSubmit={handleRefineSubmit}>
            <div className="refine-input-wrapper">
              <input
                type="text"
                className="refine-input"
                placeholder="Ask RoamAI to modify your itinerary..."
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                disabled={refineLoading}
                required
              />
              <button 
                type="submit" 
                className="refine-submit-btn"
                disabled={refineLoading || !refinementPrompt.trim()}
                title="Send instruction to AI"
              >
                <Sparkles size={18} />
              </button>
            </div>
          </form>

          {refineLoading && (
            <div className="refine-loading-indicator">
              <span>⏳</span> Refining itinerary with Groq Llama-3.3...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ItineraryView;
