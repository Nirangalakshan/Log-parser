"use client";

import { useState } from "react";

export default function StateTable({ l2ChildState }) {
  // Sort by timestamp initially
  const [sortDirection, setSortDirection] = useState("asc");
  const sortedData = [...(l2ChildState || [])].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
  });

  // Toggle sort direction
  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Render nothing or a message if no data
  if (sortedData.length === 0) {
    return <div className="text-center text-gray-500 p-4">No state data available to display.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Table Section with Scrollable Area */}
      <div className="overflow-x-auto">
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-900 shadow">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={handleSort}>
                  Timestamp {sortDirection === "asc" ? "↑" : "↓"}
                </th>
                <th className="py-2 px-4 border-b text-left">State</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 px-4 border-b">{item.timestamp || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{item.state || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}