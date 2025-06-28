// "use client";

// import { useState } from "react";

// export default function StateTable({ l2ChildState }) {
//   // Sort by timestamp initially
//   const [sortDirection, setSortDirection] = useState("asc");
//   const sortedData = [...(l2ChildState || [])].sort((a, b) => {
//     const aTime = new Date(a.timestamp).getTime();
//     const bTime = new Date(b.timestamp).getTime();
//     return sortDirection === "asc" ? aTime - bTime : bTime - aTime;
//   });

//   // Toggle sort direction
//   const handleSort = () => {
//     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//   };

//   // Render nothing or a message if no data
//   if (sortedData.length === 0) {
//     return <div className="text-center text-gray-500 p-4">No state data available to display.</div>;
//   }

//   return (
//     <div className="space-y-6">
//       {/* Table Section with Scrollable Area */}
//       <div className="overflow-x-auto">
//         <div className="max-h-64 overflow-y-auto border rounded-lg">
//           <table className="min-w-full bg-white dark:bg-gray-900 shadow">
//             <thead>
//               <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0">
//                 <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={handleSort}>
//                   Timestamp {sortDirection === "asc" ? "↑" : "↓"}
//                 </th>
//                 <th className="py-2 px-4 border-b text-left">State</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sortedData.map((item, index) => (
//                 <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                   <td className="py-2 px-4 border-b">{item.timestamp || "N/A"}</td>
//                   <td className="py-2 px-4 border-b">{item.state || "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }






// "use client";

// import React, { useState, useMemo } from "react";

// function StateTable({ l2MainState = [] }) {
//   const [selectedParameter, setSelectedParameter] = useState(
//     l2MainState.length > 0 && Object.keys(l2MainState[0]).find((key) => key !== "timestamp") || "state"
//   );

//   const availableParameters = useMemo(() => {
//     if (l2MainState.length === 0) return [];
//     return Object.keys(l2MainState[0])
//       .filter((key) => key !== "timestamp")
//       .sort();
//   }, [l2MainState]);

//   if (l2MainState.length === 0) {
//     return <div className="text-center text-gray-500 p-4">No main state data available.</div>;
//   }

//   return (
//     <div className="overflow-x-auto">
//       <div className="mb-4">
//         <label htmlFor="parameterSelect" className="mr-2 text-gray-800 dark:text-gray-100">
//           Select Parameter:
//         </label>
//         <select
//           id="parameterSelect"
//           value={selectedParameter}
//           onChange={(e) => setSelectedParameter(e.target.value)}
//           className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//           disabled={availableParameters.length === 0}
//         >
//           {availableParameters.map((param) => (
//             <option key={param} value={param}>
//               {param}
//             </option>
//           ))}
//           {availableParameters.length === 0 && (
//             <option value="N/A">No Parameters</option>
//           )}
//         </select>
//       </div>
//       <table className="min-w-full bg-white dark:bg-gray-900 shadow rounded-lg">
//         <thead>
//           <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0">
//             <th className="py-2 px-4 border-b text-left">Timestamp</th>
//             <th className="py-2 px-4 border-b text-left">Selected Parameter Value</th>
//           </tr>
//         </thead>
//         <tbody>
//           {l2MainState.map((item, index) => (
//             <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b">
//               <td className="py-2 px-4 border-b">{item.timestamp || "N/A"}</td>
//               <td className="py-2 px-4 border-b">{item[selectedParameter] || "N/A"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default StateTable;






"use client";

import React, { useState, useMemo } from "react";

function StateTable({ stateData = [] }) {
  // Compute unique parameters across all stateData objects
  const availableParameters = useMemo(() => {
    if (stateData.length === 0) return [];
    const allKeys = new Set();
    stateData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (key !== "timestamp") {
          allKeys.add(key);
        }
      });
    });
    return Array.from(allKeys).sort(); // Sort alphabetically for consistency
  }, [stateData]); // Recompute when stateData changes

  // Set initial selectedParameter to the first available parameter, or "state" if none
  const [selectedParameter, setSelectedParameter] = useState(
    availableParameters.length > 0 ? availableParameters[0] : "state"
  );

  if (stateData.length === 0) {
    return <div className="text-center text-gray-500 p-4">No state data available.</div>;
  }

  // Filter out rows where the selected parameter is "N/A" or undefined/null
  const filteredStateData = stateData.filter(
    (item) => item[selectedParameter] && item[selectedParameter] !== "N/A"
  );

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <label htmlFor="parameterSelect" className="mr-2 text-gray-800 dark:text-gray-100">
          Select Parameter:
        </label>
        <select
          id="parameterSelect"
          value={selectedParameter}
          onChange={(e) => setSelectedParameter(e.target.value)}
          className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          disabled={availableParameters.length === 0}
        >
          {availableParameters.map((param) => (
            <option key={param} value={param}>
              {param}
            </option>
          ))}
          {availableParameters.length === 0 && (
            <option value="N/A">No Parameters</option>
          )}
        </select>
      </div>
      <div className="max-h-96 overflow-y-auto border rounded-lg shadow"> {/* Scrollable container with fixed height */}
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0">
              <th className="py-2 px-4 border-b text-left">Timestamp</th>
              <th className="py-2 px-4 border-b text-left">{selectedParameter}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStateData.map((item, index) => {
              const value = item[selectedParameter];
              let rowClass = "";
              if (value === "idle" || value === "ready" || value === "connected") {
                rowClass = "bg-green-100 dark:bg-green-900"; // Low green
              } else if (value === "checking") {
                rowClass = "bg-orange-100 dark:bg-orange-900"; // Low orange
              } else if (value === "failed") {
                rowClass = "bg-red-100 dark:bg-red-900"; // Low red
              }
              else if (value === "checked"){
                rowClass = "bg-yellow-100 dark:bg-yellow-900"; // Low yellow
              }

              return (
                <tr key={index} className={`border-b dark:border-gray-700 ${rowClass}`}>
                  <td className="py-2 px-4">{item.timestamp}</td>
                  <td className="py-2 px-4">{value}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StateTable;