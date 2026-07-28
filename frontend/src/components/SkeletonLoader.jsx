import React from "react";

function SkeletonLoader() {
  return (
    <div className="skeleton-container glass-card">
      {/* Title skeleton */}
      <div className="skeleton-shimmer skeleton-title"></div>
      
      {/* Accordion headers skeleton */}
      <div className="skeleton-shimmer skeleton-accordion"></div>
      
      {/* Expanded day simulation with card skeletons */}
      <div style={{ paddingLeft: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div className="skeleton-shimmer skeleton-card"></div>
        <div className="skeleton-shimmer skeleton-card"></div>
      </div>

      <div className="skeleton-shimmer skeleton-accordion" style={{ marginTop: "1rem" }}></div>
      <div className="skeleton-shimmer skeleton-accordion"></div>
    </div>
  );
}

export default SkeletonLoader;
