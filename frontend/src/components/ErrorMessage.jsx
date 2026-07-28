import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

function ErrorMessage({ error, onRetry }) {
  return (
    <div className="glass-card error-container">
      <AlertCircle size={44} className="error-icon" />
      <h3 className="error-title">Oops! Planning Failed</h3>
      <p className="error-msg">
        {error || "Something went wrong while communicating with the AI. This is usually due to network congestion or API limits."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          <RotateCcw size={16} />
          Retry Request
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
