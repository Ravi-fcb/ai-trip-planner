import React, { useState } from "react";
import { Send, MapPin } from "lucide-react";

const PRESETS = [
  "3 days in Goa, beach hopping and water sports, mid-range budget",
  "5 days in Paris, art museums and cozy cafes, luxury style",
  "4 days in Tokyo, anime spots, sushi crawls and tech shopping",
  "Weekend getaway to Grand Canyon, hiking and sunset viewpoints"
];

function TripForm({ onSubmit, loading }) {
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim() && !loading) {
      onSubmit(description.trim());
    }
  };

  const handlePresetClick = (preset) => {
    setDescription(preset);
  };

  return (
    <div className="glass-card">
      <form onSubmit={handleSubmit} className="prompt-form">
        <label htmlFor="trip-desc" className="form-label">
          Describe your dream trip
        </label>
        
        <div className="textarea-wrapper">
          <textarea
            id="trip-desc"
            className="prompt-textarea"
            placeholder="Tell us where you want to go, for how long, your interests, travel style (e.g., family, solo, adventure), and budget..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            maxLength={1000}
            required
          />
        </div>

        <div className="presets-container">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              className="preset-tag"
              onClick={() => handlePresetClick(preset)}
              disabled={loading}
            >
              {preset.split(",")[0]}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || !description.trim()}
        >
          {loading ? (
            <>
              <span className="spinner-border animate-spin">⏳</span>
              Crafting Itinerary...
            </>
          ) : (
            <>
              <Send size={18} />
              Plan My Trip
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TripForm;
