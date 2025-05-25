const FormatTimestamp = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  if (days > 1) {
    return `${days} days ago`;
  }
  if (days === 1) {
    return 'yesterday';
  }
  if (hours >= 1) {
    return `${hours} hours ago`;
  }
  if (minutes >= 1) {
    return `${minutes} minutes ago`;
  }
  return 'now';
};

export default FormatTimestamp;