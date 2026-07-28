import React, { useState, useEffect, useRef } from "react";
import { Plane, Sun, Moon } from "lucide-react";
import TripForm from "./components/TripForm";
import ItineraryView from "./components/ItineraryView";
import SavedTripsList from "./components/SavedTripsList";
import SkeletonLoader from "./components/SkeletonLoader";
import ErrorMessage from "./components/ErrorMessage";

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [activeTripId, setActiveTripId] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [refineLoading, setRefineLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [lastPrompt, setLastPrompt] = useState("");

  const activeRequestIdRef = useRef(0);

  // Load state from local storage on mount
  useEffect(() => {
    const savedList = localStorage.getItem("roamai_saved_trips");
    const savedActiveId = localStorage.getItem("roamai_active_trip_id");
    const savedTheme = localStorage.getItem("roamai_theme");

    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        setSavedTrips(parsed);

        // Load active trip if it existed
        if (savedActiveId) {
          const activeTrip = parsed.find(t => t.id === savedActiveId);
          if (activeTrip) {
            setItinerary(activeTrip);
            setActiveTripId(savedActiveId);
          }
        }
      } catch (e) {
        console.error("Failed to parse saved itineraries", e);
      }
    }

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Sync saved trips changes to local storage
  const updateSavedTrips = (newList) => {
    setSavedTrips(newList);
    localStorage.setItem("roamai_saved_trips", JSON.stringify(newList));
  };

  // Sync theme changes
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("roamai_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Generate stable stop IDs
  const processItineraryData = (data, oldItinerary = null) => {
    if (!data || !data.days) return data;

    const existingIdMap = new Map();
    if (oldItinerary && oldItinerary.days) {
      oldItinerary.days.forEach((day) => {
        (day.stops || []).forEach((stop) => {
          if (stop.id) {
            existingIdMap.set(`${day.day}-${stop.name.toLowerCase()}`, stop.id);
          }
        });
      });
    }

    return {
      ...data,
      days: data.days.map((day) => ({
        ...day,
        stops: (day.stops || []).map((stop, index) => {
          const mapKey = `${day.day}-${stop.name.toLowerCase()}`;
          const preservedId = existingIdMap.get(mapKey);
          return {
            ...stop,
            id: stop.id || preservedId || `${day.day}-${index}-${Math.random().toString(36).substr(2, 9)}`
          };
        })
      }))
    };
  };

  // Generate a new trip (Initial prompt submission)
  const handlePlanTrip = async (description) => {
    setLoading(true);
    setError(null);
    setLastPrompt(description);
    setItinerary(null);
    setActiveTripId(null);

    const requestId = Date.now();
    activeRequestIdRef.current = requestId;

    try {
      const response = await fetch("http://localhost:3001/api/plan-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const result = await response.json();

      if (activeRequestIdRef.current !== requestId) return;

      if (result.success) {
        const processed = processItineraryData(result.data);
        setItinerary(processed);
        // Note: We don't save to history immediately; the user will click "Save"
      } else {
        throw new Error(result.error || "Failed to generate itinerary.");
      }
    } catch (err) {
      if (activeRequestIdRef.current === requestId) {
        setError(err.message);
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  // Refine an active trip
  const handleRefineTrip = async (refinementPrompt) => {
    if (!itinerary || refineLoading) return;

    setRefineLoading(true);
    setError(null);

    const requestId = Date.now();
    activeRequestIdRef.current = requestId;

    try {
      const response = await fetch("http://localhost:3001/api/refine-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentItinerary: itinerary,
          prompt: refinementPrompt
        }),
      });

      const result = await response.json();

      if (activeRequestIdRef.current !== requestId) return;

      if (result.success) {
        const processed = processItineraryData(result.data, itinerary);
        
        // If this trip has already been saved to the dashboard, update it in history too
        if (activeTripId) {
          const updated = { ...processed, id: activeTripId, createdAt: itinerary.createdAt, isFavorite: itinerary.isFavorite };
          setItinerary(updated);
          const updatedList = savedTrips.map(t => t.id === activeTripId ? updated : t);
          updateSavedTrips(updatedList);
        } else {
          setItinerary(processed);
        }
      } else {
        throw new Error(result.error || "Failed to refine itinerary.");
      }
    } catch (err) {
      if (activeRequestIdRef.current === requestId) {
        setError(err.message);
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setRefineLoading(false);
      }
    }
  };

  // Save the current active (unsaved) itinerary to History
  const handleSaveToHistory = () => {
    if (!itinerary || activeTripId) return;

    const newTripId = `trip-${Date.now()}`;
    const newTrip = {
      ...itinerary,
      id: newTripId,
      createdAt: new Date().toISOString(),
      isFavorite: false
    };

    const newList = [newTrip, ...savedTrips];
    updateSavedTrips(newList);
    setActiveTripId(newTripId);
    setItinerary(newTrip);
    localStorage.setItem("roamai_active_trip_id", newTripId);
    alert("Itinerary saved to your dashboard! 🧭");
  };

  // Load a trip from history
  const handleLoadTrip = (id) => {
    const trip = savedTrips.find(t => t.id === id);
    if (trip) {
      setItinerary(trip);
      setActiveTripId(id);
      localStorage.setItem("roamai_active_trip_id", id);
      setError(null);
    }
  };

  // Delete a trip from history
  const handleDeleteTrip = (id) => {
    const updatedList = savedTrips.filter(t => t.id !== id);
    updateSavedTrips(updatedList);

    if (activeTripId === id) {
      setItinerary(null);
      setActiveTripId(null);
      localStorage.removeItem("roamai_active_trip_id");
    }
  };

  // Duplicate a trip in history
  const handleDuplicateTrip = (id) => {
    const trip = savedTrips.find(t => t.id === id);
    if (trip) {
      const duplicatedTrip = {
        ...trip,
        id: `trip-${Date.now()}`,
        destination: `${trip.destination} (Copy)`,
        createdAt: new Date().toISOString(),
        isFavorite: false
      };
      
      const updatedList = [duplicatedTrip, ...savedTrips];
      updateSavedTrips(updatedList);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (id) => {
    const updatedList = savedTrips.map((t) => {
      if (t.id === id) {
        const updatedTrip = { ...t, isFavorite: !t.isFavorite };
        // Sync active state if it's the currently open trip
        if (activeTripId === id) {
          setItinerary(updatedTrip);
        }
        return updatedTrip;
      }
      return t;
    });
    updateSavedTrips(updatedList);
  };

  // Close the active trip view
  const handleCloseActiveTrip = () => {
    setItinerary(null);
    setActiveTripId(null);
    localStorage.removeItem("roamai_active_trip_id");
    setError(null);
  };

  // Mutator: Remove stop (and sync with history if saved)
  const handleRemoveStop = (dayNumber, stopIndex) => {
    if (!itinerary) return;

    const updatedDays = itinerary.days.map((day) => {
      if (day.day === dayNumber) {
        const updatedStops = [...day.stops];
        updatedStops.splice(stopIndex, 1);
        return { ...day, stops: updatedStops };
      }
      return day;
    });

    const updatedItinerary = { ...itinerary, days: updatedDays };
    setItinerary(updatedItinerary);

    // Sync with saved lists if saved
    if (activeTripId) {
      const updatedList = savedTrips.map(t => t.id === activeTripId ? updatedItinerary : t);
      updateSavedTrips(updatedList);
    }
  };

  // Mutator: Move stop (and sync with history if saved)
  const handleMoveStop = (dayNumber, fromIndex, toIndex) => {
    if (!itinerary) return;

    const updatedDays = itinerary.days.map((day) => {
      if (day.day === dayNumber) {
        const updatedStops = [...day.stops];
        if (toIndex < 0 || toIndex >= updatedStops.length) return day;

        const temp = updatedStops[fromIndex];
        updatedStops[fromIndex] = updatedStops[toIndex];
        updatedStops[toIndex] = temp;

        return { ...day, stops: updatedStops };
      }
      return day;
    });

    const updatedItinerary = { ...itinerary, days: updatedDays };
    setItinerary(updatedItinerary);

    // Sync with saved lists if saved
    if (activeTripId) {
      const updatedList = savedTrips.map(t => t.id === activeTripId ? updatedItinerary : t);
      updateSavedTrips(updatedList);
    }
  };

  return (
    <div className="app-container">
      {/* Ambient Pulsing Background Blobs */}
      <div className="blur-blobs-container">
        <div className="blur-blob blob-1"></div>
        <div className="blur-blob blob-2"></div>
        <div className="blur-blob blob-3"></div>
      </div>

      {/* App Header */}
      <header className="app-header">
        <div className="logo-section">
          <Plane className="logo-icon" size={34} />
          <h1 className="app-title">RoamAI</h1>
        </div>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          type="button"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Form is visible if we don't have a generated itinerary */}
        {!itinerary && !loading && (
          <TripForm onSubmit={handlePlanTrip} loading={loading} />
        )}

        {/* Loading state skeleton */}
        {loading && <SkeletonLoader />}

        {/* Error state */}
        {error && !loading && (
          <ErrorMessage 
            error={error} 
            onRetry={itinerary ? () => handleRefineTrip(lastPrompt) : () => handlePlanTrip(lastPrompt)} 
          />
        )}

        {/* Empty state */}
        {!itinerary && !loading && !error && savedTrips.length === 0 && (
          <div className="empty-state">
            <Plane size={48} className="empty-icon" />
            <h2 className="empty-title">Ready to explore?</h2>
            <p>Enter your details above and RoamAI will draft your custom day-by-day travel plan using Groq Llama-3.</p>
          </div>
        )}

        {/* Render active itinerary view */}
        {itinerary && !loading && (
          <ItineraryView
            itinerary={itinerary}
            activeTripId={activeTripId}
            onRemoveStop={handleRemoveStop}
            onMoveStop={handleMoveStop}
            onReset={handleCloseActiveTrip}
            onRefine={handleRefineTrip}
            refineLoading={refineLoading}
            onSave={handleSaveToHistory}
          />
        )}

        {/* Render list of saved itineraries */}
        {!loading && (savedTrips.length > 0 || itinerary) && (
          <SavedTripsList
            savedTrips={savedTrips}
            onLoad={handleLoadTrip}
            onDelete={handleDeleteTrip}
            onDuplicate={handleDuplicateTrip}
            onToggleFavorite={handleToggleFavorite}
            activeTripId={activeTripId}
          />
        )}
      </main>
    </div>
  );
}

export default App;
