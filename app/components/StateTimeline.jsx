"use client";

import React, { useMemo } from "react";

function StateTimeline({ logData }) {
  // Handle case where logData is an array of objects instead of strings
  const parsedData = useMemo(() => {
    if (!Array.isArray(logData) || logData.length === 0) return [];
    return logData.map((item) => {
      const childKey = Object.keys(item).find(key => key !== "timestamp" && key !== "Heartbeat");
      return {
        timestamp: item.timestamp || "Unknown",
        heartbeat: item.Heartbeat || "N/A",
        childKey: childKey || "N/A",
        childState: item[childKey] || "N/A",
      };
    });
  }, [logData]);

  if (parsedData.length === 0) {
    return <div className="text-center text-gray-500 p-4">No data available to display.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Timestamp</th>
            <th className="py-2 px-4 border-b">Heartbeat</th>
            <th className="py-2 px-4 border-b">Child Key</th>
            <th className="py-2 px-4 border-b">Child State</th>
          </tr>
        </thead>
        <tbody>
          {parsedData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{item.timestamp}</td>
              <td className="py-2 px-4 border-b">{item.heartbeat}</td>
              <td className="py-2 px-4 border-b">{item.childKey}</td>
              <td className="py-2 px-4 border-b">{item.childState}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StateTimeline;