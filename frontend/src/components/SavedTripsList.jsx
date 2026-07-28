import React, { useState } from "react";
import { Star, Eye, Copy, Trash2, Calendar, MapPin, Sparkles } from "lucide-react";

function SavedTripsList({ 
  savedTrips, 
  onLoad, 
  onDelete, 
  onDuplicate, 
  onToggleFavorite,
  activeTripId
}) {
  const [filter, setFilter] = useState("all"); // "all" | "favorites"

  const filteredTrips = savedTrips.filter((trip) => {
    if (filter === "favorites") return trip.isFavorite;
    return true;
  });

  return (
    <div className="glass-card saved-trips-section">
      <div className="saved-trips-header">
        <h3 className="section-title">🧭 My Saved Itineraries</h3>
        <div className="filter-buttons">
          <button
            type="button"
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({savedTrips.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "favorites" ? "active" : ""}`}
            onClick={() => setFilter("favorites")}
          >
            Favorites ({savedTrips.filter(t => t.isFavorite).length})
          </button>
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="empty-saved-state">
          <Sparkles size={32} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
          <p>
            {filter === "favorites" 
              ? "You haven't favorited any trips yet! Star a trip in your list to see it here."
              : "No saved trips found. Plan a trip and click 'Save to Dashboard' to store it!"
            }
          </p>
        </div>
      ) : (
        <div className="saved-trips-grid">
          {filteredTrips.map((trip) => {
            const totalStops = (trip.days || []).reduce((acc, d) => acc + (d.stops || []).length, 0);
            const isLoaded = activeTripId === trip.id;

            return (
              <div key={trip.id} className={`saved-trip-card ${isLoaded ? "active-loaded" : ""}`}>
                <div className="saved-card-header">
                  <span className="saved-card-dest">
                    <MapPin size={14} style={{ marginRight: "4px" }} />
                    {trip.destination}
                  </span>
                  
                  <button
                    type="button"
                    className={`star-btn ${trip.isFavorite ? "active" : ""}`}
                    onClick={() => onToggleFavorite(trip.id)}
                    title={trip.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star size={16} fill={trip.isFavorite ? "var(--color-warning)" : "none"} />
                  </button>
                </div>

                <div className="saved-card-body">
                  <div className="saved-card-meta">
                    <span>📅 {trip.durationDays} Days</span>
                    <span>📍 {totalStops} Stops</span>
                  </div>
                  <span className="saved-card-date">
                    <Calendar size={12} style={{ marginRight: "4px" }} />
                    {new Date(trip.createdAt).toLocaleDateString(undefined, { 
                      month: "short", 
                      day: "numeric", 
                      year: "numeric" 
                    })}
                  </span>
                </div>

                <div className="saved-card-actions">
                  <button
                    type="button"
                    className="card-action-btn load-btn"
                    onClick={() => onLoad(trip.id)}
                    title="Load/Edit itinerary"
                  >
                    <Eye size={14} />
                    <span>{isLoaded ? "Active" : "Load"}</span>
                  </button>
                  
                  <button
                    type="button"
                    className="card-action-btn duplicate-btn"
                    onClick={() => onDuplicate(trip.id)}
                    title="Duplicate itinerary"
                  >
                    <Copy size={14} />
                  </button>
                  
                  <button
                    type="button"
                    className="card-action-btn delete-btn-small"
                    onClick={() => onDelete(trip.id)}
                    title="Delete itinerary"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedTripsList;
