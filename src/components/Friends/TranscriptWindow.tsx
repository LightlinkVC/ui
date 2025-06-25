import React from 'react';
import FormatTimestamp from './utils/DateFormatter';
import './TranscriptWindow.css';

interface TranscriptMessage {
  message: string;
  timestamp: Date;
}

interface TranscriptWindowProps {
  messages: TranscriptMessage[];
}

const TranscriptWindow: React.FC<TranscriptWindowProps> = ({ messages }) => {
  return (
    <div className="transcript-container">
      <div className="transcript-content">
        {messages.map((message, index) => (
          <div key={index} className="transcript-message message">
            <div className="message-header">
              <span className="transcript-icon">🎤</span>
              <span className="message-time">{FormatTimestamp(message.timestamp)}</span>
            </div>
            <div className="message-content">{message.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptWindow;