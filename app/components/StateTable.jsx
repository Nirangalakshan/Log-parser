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
