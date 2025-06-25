import React, { useState, useRef } from 'react';
import { axiosInstance } from "../../api/api.config";
import { authStore } from '../../store/AuthStore';
import './MessageInput.css';

type MessageInputProps = {
  groupId: number;
  lastId: number;
  onNewMessage: (message: any) => void;
};

type FilePreview = {
  file: File;
  preview: string;
};

const MessageInput = ({ groupId, lastId, onNewMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;

    const tempDate = new Date();
    const tempMessageId = lastId ? lastId + 1 : 1;

    const tempMessage = {
      user_id: authStore.userId,
      group_id: groupId,
      content: message,
      files: files.map(file => ({
        name: file.file.name,
        type: file.file.type,
        preview: file.preview,
        status: 'uploading',
        url: ''
      })),
      created_at: tempDate.toISOString(),
      id: tempMessageId,
      status: 'pending',
      isTemp: true
    };

    try {
      const formData = new FormData();
      formData.append('group_id', groupId.toString());
      formData.append('content', message);
      
      files.forEach((file, index) => {
        formData.append(`files`, file.file);
      });

      const tempFilesData = files.map(file => ({
        preview: file.preview,
        file: file.file
      }));

      // todo dedup
      // onNewMessage(tempMessage);

      const response = await axiosInstance.post('/api/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const serverMessage = response.data;
      onNewMessage({
        ...tempMessage,
        ...serverMessage,
        isTemp: false,
        files: response.data.files?.map((f: any) => ({
          ...f,
          status: 'uploaded'
        }))
      });

      setMessage('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';

      files.forEach(file => URL.revokeObjectURL(file.preview));
    } catch (error) {
      onNewMessage({
        ...tempMessage,
        status: 'failed'
      });

      console.error('Error sending message:', error);
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <div className="file-previews">
        {files.map((file, index) => (
          <div key={index} className="file-preview">
            {file.file.type.startsWith('image/') ? (
              <img src={file.preview} alt={file.file.name} />
            ) : (
              <div className="file-info">
                <span>{file.file.name}</span>
              </div>
            )}
            <button type="button" onClick={() => removeFile(index)}>×</button>
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileSelect}
          className="file-input"
          accept="image/*, .pdf, .doc, .docx, .txt"
          id="file-input"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="clip-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="input-field"
        />
        <button type="submit" className="send-button">
          <svg 
            className="send-icon" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24"
            fill="none"
          >
            <path 
              d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" 
              fill="currentColor"
            />
          </svg>
      </button>
      </div>
    </form>
  );
};

export default MessageInput;