// "use client";

// import React, { useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import StatusBadge from "./StatusBadge";
// import dayjs from "dayjs";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// import { Line } from "react-chartjs-2";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// function StatusContext({ l2MainState = [], l2MainContext = [] }) {
//   const [selectedTransactionId, setSelectedTransactionId] = useState("");
//   const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
//   const [showGraph, setShowGraph] = useState("energy"); // "energy" or "power"

//   const contextWithTimestamps = useMemo(() => {
//     return l2MainContext.map((item) => {
//       const rawString = item.timestamp ?? item.raw ?? "";
//       const found = rawString.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
//       const ts = found ? found[1] : null;
//       return { ...item, timestamp: ts };
//     });
//   }, [l2MainContext]);

//   const transactionIds = useMemo(() => {
//     const ids = new Set(contextWithTimestamps.map((item) => item.transactionId));
//     return ["", ...Array.from(ids).filter(Boolean)];
//   }, [contextWithTimestamps]);

//   const selectedTxIdNumber = Number(selectedTransactionId);

//   const filteredAndSortedContext = useMemo(() => {
//     const dataToSort =
//       selectedTransactionId && selectedTransactionId !== ""
//         ? contextWithTimestamps.filter(
//             (item) => item.transactionId === selectedTxIdNumber
//           )
//         : contextWithTimestamps;

//     const sorted = dataToSort
//       .filter((item) => item.timestamp)
//       .slice()
//       .sort((a, b) => {
//         const timeA = dayjs(a.timestamp, "YYYY-MM-DD HH:mm:ss").valueOf();
//         const timeB = dayjs(b.timestamp, "YYYY-MM-DD HH:mm:ss").valueOf();
//         return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
//       });

//     return sorted;
//   }, [contextWithTimestamps, selectedTransactionId, selectedTxIdNumber, sortDirection]);

//   // Prepare data for charts
//   const chartLabels = filteredAndSortedContext.map((item) =>
//     dayjs(item.timestamp).format("HH:mm:ss")
//   );

//   const energyData = filteredAndSortedContext.map((item) => item.consumedEnergy ?? 0);
//   const powerData = filteredAndSortedContext.map((item) => item.power ?? 0);

//   const energyChartData = {
//     labels: chartLabels,
//     datasets: [
//       {
//         label: "Energy (kWh)",
//         data: energyData,
//         borderColor: "rgb(34, 197, 94)", // green
//         backgroundColor: "rgba(34, 197, 94, 0.3)",
//         tension: 0.3,
//         borderWidth: 1,
//         fill: true,
//       },
//     ],
//   };

//   const powerChartData = {
//     labels: chartLabels,
//     datasets: [
//       {
//         label: "Power (kW)",
//         data: powerData,
//         borderColor: "rgb(59, 130, 246)", // blue
//         backgroundColor: "rgba(59, 130, 246, 0.3)",
//         tension: 0.3,
//         borderWidth: 1,
//         fill: true,
//       },
//     ],
//   };

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false, // let’s control height via container style
//     interaction: {
//       mode: "index",
//       intersect: false,
//     },
//     stacked: false,
//     plugins: {
//       legend: {
//         position: "top",
//         labels: {
//           color: "#374151", // dark text color
//         },
//       },
//       title: {
//         display: false,
//       },
//       tooltip: {
//         enabled: true,
//         mode: "nearest",
//         intersect: false,
//       },
//     },
//     scales: {
//       x: {
//         ticks: { color: "#374151" },
//         grid: {
//           display: false,
//         },
//       },
//       y: {
//         ticks: { color: "#374151" },
//         grid: {
//           borderDash: [4, 4],
//           color: "#d1d5db", // light gray grid lines
//         },
//       },
//     },
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//       className="bg-white dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto hover:shadow-xl transition-all duration-300"
//       suppressHydrationWarning
//     >
//       {/* Charger Status Section */}
//       <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 sticky top-0 bg-white dark:bg-gray-900/80 z-10">
//         Charger Status
//       </h2>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="space-y-4 max-h-[400px] overflow-y-auto"
//       >
//       </motion.div>

//       {/* Filters & Sorting Controls */}
//       <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
//         <div>
//           <label htmlFor="transactionId" className="mr-2 text-gray-800 dark:text-gray-100">
//             Select Transaction ID:
//           </label>
//           <select
//             id="transactionId"
//             value={selectedTransactionId}
//             onChange={(e) => setSelectedTransactionId(e.target.value)}
//             className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
//           >
//             {transactionIds.map((id) => (
//               <option key={id} value={id}>
//                 {id || "All"}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//           >
//             Sort: {sortDirection === "asc" ? "Oldest First" : "Newest First"}
//           </button>
//           <button
//             onClick={() => setShowGraph(showGraph === "energy" ? "power" : "energy")}
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//           >
//             Show: {showGraph === "energy" ? "Power" : "Energy"}
//           </button>
//         </div>
//       </div>

//       {/* Chart Container with fixed smaller height */}
//       <div style={{ height: "300px" }}>
//         {showGraph === "energy" ? (
//           energyData.length > 0 ? (
//             <>
//               <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
//                 Energy (kWh)
//               </h3>
//               <Line options={chartOptions} data={energyChartData} />
//             </>
//           ) : (
//             <p className="text-gray-500 dark:text-gray-400 text-center">No energy data to display.</p>
//           )
//         ) : powerData.length > 0 ? (
//           <>
//             <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
//               Power (kW)
//             </h3>
//             <Line options={chartOptions} data={powerChartData} />
//           </>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-400 text-center">No power data to display.</p>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// export default StatusContext;






"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StatusContext({ l2MainState = [], l2MainContext = [] }) {
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"
  const [showGraph, setShowGraph] = useState("all"); // "all" or "full" (simplified to reflect no filtering)

  const contextWithTimestamps = useMemo(() => {
    return l2MainContext.map((item) => {
      const rawString = item.timestamp ?? item.raw ?? "";
      const found = rawString.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
      const ts = found ? found[1] : null;
      return { ...item, timestamp: ts };
    });
  }, [l2MainContext]);

  const transactionIds = useMemo(() => {
    const ids = new Set(contextWithTimestamps.map((item) => item.transactionId));
    return Array.from(ids).filter(Boolean); // Remove empty option since no filtering
  }, [contextWithTimestamps]);

  // Use all data, sorted by timestamp
  const sortedContext = useMemo(() => {
    return contextWithTimestamps
      .filter((item) => item.timestamp)
      .slice()
      .sort((a, b) => {
        const timeA = dayjs(a.timestamp, "YYYY-MM-DD HH:mm:ss").valueOf();
        const timeB = dayjs(b.timestamp, "YYYY-MM-DD HH:mm:ss").valueOf();
        return sortDirection === "asc" ? timeA - timeB : timeB - timeA;
      });
  }, [contextWithTimestamps, sortDirection]);

  // Prepare data for charts
  const chartLabels = sortedContext.map((item) =>
    dayjs(item.timestamp).format("HH:mm:ss")
  );
  const energyData = sortedContext.map((item) => item.consumedEnergy ?? 0);
  const powerData = sortedContext.map((item) => item.power ?? 0);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Energy (kWh)",
        data: energyData,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.3)",
        tension: 0.3,
        borderWidth: 1,
        fill: true,
        yAxisID: "y1",
      },
      {
        label: "Power (kW)",
        data: powerData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        tension: 0.3,
        borderWidth: 1,
        fill: true,
        yAxisID: "y2",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151",
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "nearest",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: { color: "#374151" },
        grid: {
          display: false,
        },
      },
      y1: {
        type: "linear",
        position: "left",
        ticks: { color: "#374151" },
        grid: {
          borderDash: [4, 4],
          color: "#d1d5db",
        },
        title: {
          display: true,
          text: "Energy (kWh)",
          color: "rgb(34, 197, 94)",
        },
      },
      y2: {
        type: "linear",
        position: "right",
        ticks: { color: "#374151" },
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Power (kW)",
          color: "rgb(59, 130, 246)",
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto hover:shadow-xl transition-all duration-300"
      suppressHydrationWarning
    >
      {/* Charger Status Section */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 sticky top-0 bg-white dark:bg-gray-900/80 z-10">
        Charger Status
      </h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 max-h-[400px] overflow-y-auto"
      >
      </motion.div>

      {/* Sorting Controls */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div>
          <label htmlFor="transactionIds" className="mr-2 text-gray-800 dark:text-gray-100">
            Transaction IDs (for reference):
          </label>
          <select
            id="transactionIds"
            value=""
            className="p-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            disabled // Display only, no interaction
          >
            {transactionIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sort: {sortDirection === "asc" ? "Oldest First" : "Newest First"}
          </button>
          <button
            onClick={() => setShowGraph(showGraph === "all" ? "full" : "all")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Show: {showGraph === "all" ? "Full" : "All"}
          </button>
        </div>
      </div>

      {/* Chart Container with adjustable height */}
      <div style={{ height: "400px", position: "relative" }}>
        {energyData.length > 0 || powerData.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
              Energy and Power Trends (All IDs)
            </h3>
            <Line options={chartOptions} data={chartData} />
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">No data to display.</p>
        )}
      </div>
    </motion.div>
  );
}

export default StatusContext;