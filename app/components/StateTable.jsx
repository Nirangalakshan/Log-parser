// "use client";

// import React, { useState, useMemo } from "react";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// // Register Chart.js components
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// function StateTable({ stateData = [] }) {
//   // Compute unique parameters across all stateData objects
//   const availableParameters = useMemo(() => {
//     if (stateData.length === 0) return [];
//     const allKeys = new Set();
//     stateData.forEach((item) => {
//       Object.keys(item).forEach((key) => {
//         if (key !== "timestamp") {
//           allKeys.add(key);
//         }
//       });
//     });
//     return Array.from(allKeys).sort(); // Sort alphabetically for consistency
//   }, [stateData]);

//   // Set initial selectedParameter to the first available parameter, or "state" if none
//   const [selectedParameter, setSelectedParameter] = useState(
//     availableParameters.length > 0 ? availableParameters[0] : "state"
//   );

//   // Filter out rows where the selected parameter is "N/A" or undefined/null
//   const filteredStateData = useMemo(() => {
//     return stateData.filter(
//       (item) => item[selectedParameter] && item[selectedParameter] !== "N/A"
//     );
//   }, [stateData, selectedParameter]);

//   // Prepare data for the graph
//   const chartData = useMemo(() => {
//     // Get unique state values for the selected parameter
//     const uniqueStates = [...new Set(filteredStateData.map(item => item[selectedParameter]))]
//       .filter(val => val != null)
//       .sort();

//     // Map states to numeric indices for plotting
//     const stateToIndex = uniqueStates.reduce((acc, state, index) => {
//       acc[state] = index;
//       return acc;
//     }, {});

//     const labels = filteredStateData.map(item => item.timestamp || "N/A");
//     const values = filteredStateData.map(item => stateToIndex[item[selectedParameter]]);

//     return {
//       labels,
//       datasets: [
//         {
//           label: `${selectedParameter} States`,
//           data: values,
//           borderColor: "rgba(75, 192, 192, 1)",
//           backgroundColor: "rgba(75, 192, 192, 0.2)",
//           fill: false,
//           pointBackgroundColor: filteredStateData.map(item => {
//             const value = item[selectedParameter];
//             if (value === "idle" || value === "ready" || value === "connected") {
//               return "rgba(34, 197, 94, 1)"; // Green
//             } else if (value === "checking") {
//               return "rgba(249, 115, 22, 1)"; // Orange
//             } else if (value === "failed") {
//               return "rgba(239, 68, 68, 1)"; // Red
//             } else if (value === "checked") {
//               return "rgba(234, 179, 8, 1)"; // Yellow
//             }
//             return "rgba(75, 192, 192, 1)"; // Default teal
//           }),
//           pointRadius: 5,
//         },
//       ],
//     };
//   }, [filteredStateData, selectedParameter]);

//   // Custom tooltip to show state names instead of numeric indices
//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       legend: { position: "top" },
//       title: {
//         display: true,
//         text: `${selectedParameter} Over Time`,
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             const index = context.dataIndex;
//             const state = filteredStateData[index][selectedParameter];
//             return `${selectedParameter}: ${state}`;
//           },
//         },
//       },
//     },
//     scales: {
//       x: { title: { display: true, text: "Timestamp" } },
//       y: {
//         title: { display: true, text: `${selectedParameter} (States)` },
//         ticks: {
//           callback: function (value) {
//             const states = [...new Set(filteredStateData.map(item => item[selectedParameter]))].sort();
//             return states[value] || value;
//           },
//         },
//       },
//     },
//   };

//   if (stateData.length === 0) {
//     return <div className="text-center text-gray-500 p-4">No state data available.</div>;
//   }

//   return (
//     <div className="space-y-6">
//       <div className="overflow-x-auto">
//         <div className="mb-4">
//           <label htmlFor="parameterSelect" className="mr-2 text-gray-800 dark:text-gray-100">
//             Select Parameter:
//           </label>
//           <select
//             id="parameterSelect"
//             value={selectedParameter}
//             onChange={(e) => setSelectedParameter(e.target.value)}
//             className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//             disabled={availableParameters.length === 0}
//           >
//             {availableParameters.map((param) => (
//               <option key={param} value={param}>
//                 {param}
//               </option>
//             ))}
//             {availableParameters.length === 0 && (
//               <option value="N/A">No Parameters</option>
//             )}
//           </select>
//         </div>
//         <div className="max-h-96 overflow-y-auto border rounded-lg shadow">
//           <table className="min-w-full bg-white dark:bg-gray-900">
//             <thead>
//               <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0">
//                 <th className="py-2 px-4 border-b text-left">Timestamp</th>
//                 <th className="py-2 px-4 border-b text-left">{selectedParameter}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredStateData.map((item, index) => {
//                 const value = item[selectedParameter];
//                 let rowClass = "";
//                 if (value === "idle" || value === "ready" || value === "connected") {
//                   rowClass = "bg-green-100 dark:bg-green-900";
//                 } else if (value === "checking") {
//                   rowClass = "bg-orange-100 dark:bg-orange-900";
//                 } else if (value === "failed") {
//                   rowClass = "bg-red-100 dark:bg-red-900";
//                 } else if (value === "checked") {
//                   rowClass = "bg-yellow-100 dark:bg-yellow-900";
//                 }

//                 return (
//                   <tr key={index} className={`border-b dark:border-gray-700 ${rowClass}`}>
//                     <td className="py-2 px-4">{item.timestamp}</td>
//                     <td className="py-2 px-4">{value}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       {filteredStateData.length > 0 && (
//         <div className="border rounded-lg shadow p-4 bg-white dark:bg-gray-900">
//           <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
//             {selectedParameter} Over Time
//           </h3>
//           <Line data={chartData} options={chartOptions} />
//         </div>
//       )}
//     </div>
//   );
// }

// export default StateTable;






"use client";

import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  }, [stateData]);

  // Set initial selectedParameter to the first available parameter, or "state" if none
  const [selectedParameter, setSelectedParameter] = useState(
    availableParameters.length > 0 ? availableParameters[0] : "state"
  );

  // Filter out rows where the selected parameter is "N/A" or undefined/null
  const filteredStateData = useMemo(() => {
    return stateData.filter(
      (item) => item[selectedParameter] && item[selectedParameter] !== "N/A"
    );
  }, [stateData, selectedParameter]);

  // Prepare data for the graph
  const chartData = useMemo(() => {
    // Get unique state values for the selected parameter
    const uniqueStates = [...new Set(filteredStateData.map(item => item[selectedParameter]))]
      .filter(val => val != null)
      .sort();

    // Map states to numeric indices for plotting
    const stateToIndex = uniqueStates.reduce((acc, state, index) => {
      acc[state] = index;
      return acc;
    }, {});

    const labels = filteredStateData.map(item => item.timestamp || "N/A");
    const values = filteredStateData.map(item => stateToIndex[item[selectedParameter]]);

    return {
      labels,
      datasets: [
        {
          label: `${selectedParameter} States`,
          data: values,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: false,
          pointBackgroundColor: filteredStateData.map(item => {
            const value = item[selectedParameter];
            if (selectedParameter === "idTag") {
              return "rgba(75, 192, 192, 1)"; // Teal for idTag
            }
            if (value === "idle" || value === "ready" || value === "connected") {
              return "rgba(34, 197, 94, 1)"; // Green
            } else if (value === "checking") {
              return "rgba(249, 115, 22, 1)"; // Orange
            } else if (value === "failed") {
              return "rgba(239, 68, 68, 1)"; // Red
            } else if (value === "checked") {
              return "rgba(234, 179, 8, 1)"; // Yellow
            }
            return "rgba(75, 192, 192, 1)"; // Default teal
          }),
          pointRadius: 5,
        },
      ],
    };
  }, [filteredStateData, selectedParameter]);

  // Custom tooltip to show state names instead of numeric indices
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `${selectedParameter} Over Time`,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const state = filteredStateData[index][selectedParameter];
            return `${selectedParameter}: ${state}`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Timestamp" } },
      y: {
        title: { display: true, text: `${selectedParameter} (States)` },
        ticks: {
          callback: function (value) {
            const states = [...new Set(filteredStateData.map(item => item[selectedParameter]))].sort();
            return states[value] || value;
          },
        },
      },
    },
  };

  if (stateData.length === 0) {
    return <div className="text-center text-gray-500 p-4">No state data available.</div>;
  }

  return (
    <div className="space-y-6">
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
        <div className="max-h-96 overflow-y-auto border rounded-lg shadow">
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
                if (selectedParameter === "idTag") {
                  rowClass = "bg-teal-100 dark:bg-teal-900"; // Teal for idTag
                } else if (value === "idle" || value === "ready" || value === "connected") {
                  rowClass = "bg-green-100 dark:bg-green-900";
                } else if (value === "checking") {
                  rowClass = "bg-orange-100 dark:bg-orange-900";
                } else if (value === "failed") {
                  rowClass = "bg-red-100 dark:bg-red-900";
                } else if (value === "checked") {
                  rowClass = "bg-yellow-100 dark:bg-yellow-900";
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
      {filteredStateData.length > 0 && (
        <div className="border rounded-lg shadow p-4 bg-white dark:bg-gray-900">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {selectedParameter} Over Time
          </h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

export default StateTable;