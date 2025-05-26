import React from 'react';
import './TranscriptWindow.css';

interface TranscriptWindowProps {
  messages: string[];
}

const TranscriptWindow: React.FC<TranscriptWindowProps> = ({ messages }) => {
  return (
    <div className="transcript-container">
      <div className="transcript-content">
        {messages.map((message, index) => (
          <div key={index} className="transcript-message message">
            <div className="message-header">
              <span className="transcript-icon">🎤</span>
              <span className="message-time">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptWindow;