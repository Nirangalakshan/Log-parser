"use client";

import React from 'react';

function StatusBadge({ status }) {
  const statusStyles = {
    connected: 'bg-gradient-to-r from-green-400 to-green-500',
    idle: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
    default: 'bg-gradient-to-r from-blue-400 to-blue-500'
  };

  const statusText = {
    connected: 'Connected',
    idle: 'Idle',
    default: status || 'N/A'
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm ${
        statusStyles[status] || statusStyles.default
      }`}
    >
      {statusText[status] || statusText.default}
    </span>
  );
}

export default StatusBadge;