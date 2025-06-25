// "use client";

// import React from 'react';
// import { motion } from 'framer-motion';
// import StatusBadge from './StatusBadge';

// function StatusContext({ l2MainState, l2MainContext }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//       className="bg-gradient-card dark:bg-dark-gradient-card p-6 rounded-2xl shadow-neumorphic dark:shadow-dark-neumorphic max-h-[400px] overflow-y-auto hover:shadow-xl transition-all duration-300"
//       suppressHydrationWarning
//     >
//       <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white sticky top-0 bg-gradient-card dark:bg-dark-gradient-card z-10">
//         Charger Status
//       </h2>

//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="space-y-4 max-h-[400px] overflow-y-auto"
//       >
//         {l2MainState.map((state, index) => (
//           <motion.div
//             key={index}
//             className="flex justify-between items-center"
//             initial={{ x: -20 }}
//             animate={{ x: 0 }}
//             transition={{ duration: 0.4, delay: index * 0.05 }}
//           >
//             <span className="text-sm text-gray-600 dark:text-gray-400">{state.timestamp}</span>
//             <div className="space-x-2">
//               <StatusBadge status={state.heartbeat} />
//               <StatusBadge status={state.meterValues} />
//             </div>
//           </motion.div>
//         ))}
//       </motion.div>

//       <h2 className="text-xl font-semibold mb-4 mt-6 text-gray-800 dark:text-white sticky top-0 bg-gradient-card dark:bg-dark-gradient-card z-10">
//         Charging Context
//       </h2>

//       <motion.div
//         initial={{ height: 0 }}
//         animate={{ height: 'auto' }}
//         transition={{ duration: 0.6 }}
//       >
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
//               <th className="p-2 text-left text-gray-800 dark:text-white">Timestamp</th>
//               <th className="p-2 text-left text-gray-800 dark:text-white">Transaction ID</th>
//               <th className="p-2 text-left text-gray-800 dark:text-white">Energy (kWh)</th>
//               <th className="p-2 text-left text-gray-800 dark:text-white">Cost ($)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {l2MainContext.map((context, index) => (
//               <tr key={index} className="border-t border-gray-200 dark:border-gray-800">
//                 <td className="p-2 text-gray-600 dark:text-gray-300">{context.timestamp}</td>
//                 <td className="p-2 text-gray-600 dark:text-gray-300">{context.transactionId}</td>
//                 <td className="p-2 text-gray-600 dark:text-gray-300">{context.consumedEnergy.toFixed(2)}</td>
//                 <td className="p-2 text-gray-600 dark:text-gray-300">{context.cost.toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </motion.div>
//     </motion.div>
//   );
// }

// export default StatusContext;







// "use client";

// import React, { useMemo } from "react";
// import { motion } from "framer-motion";
// import { Line } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   TimeScale,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import "chartjs-adapter-date-fns";
// import { enUS } from "date-fns/locale";
// import StatusBadge from "./StatusBadge";

// ChartJS.register(
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   TimeScale,
//   Title,
//   Tooltip,
//   Legend
// );

// const MAX_DISPLAY_ITEMS = 40000;

// function StatusContext({ l2MainState, l2MainContext }) {
//   // Downsample l2MainContext for the chart
//   const chartData = useMemo(() => {
//     const step = Math.ceil(l2MainContext.length / MAX_DISPLAY_ITEMS);
//     const labels = [];
//     const energyData = [];

//     for (let i = 0; i < l2MainContext.length && i < MAX_DISPLAY_ITEMS; i += step) {
//       labels.push(new Date(l2MainContext[i].timestamp));
//       energyData.push(l2MainContext[i].consumedEnergy);
//     }

//     return {
//       labels,
//       datasets: [
//         {
//           label: "Consumed Energy (kWh)",
//           data: energyData,
//           borderColor: "#2563eb", // Changed to a vibrant blue for visibility
//           backgroundColor: (context) => {
//             const ctx = context.chart.ctx;
//             const gradient = ctx.createLinearGradient(0, 0, 0, 300);
//             gradient.addColorStop(0, "rgba(37, 99, 235, 0.4)"); // Adjusted to match borderColor
//             gradient.addColorStop(1, "rgba(37, 99, 235, 0.05)");
//             return gradient;
//           },
//           fill: true,
//           tension: 0.4,
//           pointRadius: 3,
//           pointHoverRadius: 6,
//           pointBackgroundColor: "#2563eb", // Match point color to line
//           pointBorderColor: "#2563eb", // Changed from white to match line
//           pointBorderWidth: 2,
//         },
//       ],
//     };
//   }, [l2MainContext]);

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       title: {
//         display: true,
//         text: "Charging Energy Over Time",
//         color: "#1f2937",
//         font: { size: 18, weight: "bold", family: "'Inter', sans-serif" },
//         padding: { top: 10, bottom: 20 },
//       },
//       legend: {
//         display: false, // Hide legend for a cleaner look
//       },
//       tooltip: {
//         enabled: true,
//         backgroundColor: "rgba(17, 24, 39, 0.95)",
//         titleFont: { size: 14, family: "'Inter', sans-serif" },
//         bodyFont: { size: 12, family: "'Inter', sans-serif" },
//         padding: 12,
//         cornerRadius: 8,
//         boxPadding: 6,
//         callbacks: {
//           label: (context) => `${context.parsed.y.toFixed(2)} kWh`,
//         },
//       },
//     },
//     scales: {
//       x: {
//         type: "time",
//         time: {
//           unit: "minute",
//           displayFormats: { minute: "HH:mm" },
//           locale: enUS,
//         },
//         title: {
//           display: true,
//           text: "Time",
//           color: "#6b7280",
//           font: { size: 12, family: "'Inter', sans-serif" },
//         },
//         ticks: {
//           color: "#6b7280",
//           maxTicksLimit: 6,
//           maxRotation: 0,
//           autoSkip: true,
//           font: { size: 10, family: "'Inter', sans-serif" },
//         },
//         grid: {
//           display: false, // Remove x-axis grid lines for a cleaner look
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: "Energy (kWh)",
//           color: "#6b7280",
//           font: { size: 12, family: "'Inter', sans-serif" },
//         },
//         ticks: {
//           color: "#6b7280",
//           maxTicksLimit: 5,
//           callback: (value) => `${value.toFixed(2)}`,
//           font: { size: 10, family: "'Inter', sans-serif" },
//         },
//         grid: {
//           color: "rgba(209, 213, 219, 0.2)",
//           drawBorder: false,
//         },
//         beginAtZero: true,
//       },
//     },
//     interaction: {
//       mode: "nearest",
//       intersect: false,
//       axis: "x",
//     },
//     animation: {
//       duration: 1000,
//       easing: "easeOutCubic",
//     },
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//       className="bg-white dark:bg-gray-900/80 backdrop-blur-md p-6 rounded-2xl shadow-lg dark:shadow-dark-lg max-h-[80vh] overflow-y-auto hover:shadow-xl transition-all duration-300"
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
//         {l2MainState.map((state, index) => (
//           <motion.div
//             key={index}
//             className="flex justify-between items-center"
//             initial={{ x: -20 }}
//             animate={{ x: 0 }}
//             transition={{ duration: 0.4, delay: index * 0.05 }}
//           >
//             <span className="text-sm text-gray-600 dark:text-gray-400">{state.timestamp}</span>
//             <div className="space-x-2">
//               <StatusBadge status={state.heartbeat} />
//               <StatusBadge status={state.meterValues} />
//             </div>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Energy Consumption Graph Section */}
//       <h2 className="text-xl font-semibold mb-4 mt-6 text-gray-800 dark:text-gray-100 sticky top-0 bg-white dark:bg-gray-900/80 z-10">
//         Energy Consumption
//       </h2>
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//         className="relative"
//       >
//         {l2MainContext.length > 0 ? (
//           <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-inner">
//             <div style={{ height: "350px" }}>
//               <Line data={chartData} options={chartOptions} />
//             </div>
//             {l2MainContext.length >= MAX_DISPLAY_ITEMS && (
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
//                 Showing {MAX_DISPLAY_ITEMS} of {l2MainContext.length.toLocaleString()} data points for performance.
//               </p>
//             )}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             No energy data available to display.
//           </p>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// export default StatusContext;







"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";
import StatusBadge from "./StatusBadge";
import { Button } from "@/components/ui/button";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MAX_DISPLAY_ITEMS = 40000;

function StatusContext({ l2MainState = [], l2MainContext = [] }) {
  const [view, setView] = useState("energy");


  const toggleView = () => {
    setView((prev) => (prev === "energy" ? "power" : "energy"));
  };

  const { chartData, chartOptions } = useMemo(() => {
    const step = Math.ceil(l2MainContext.length / MAX_DISPLAY_ITEMS);
    const labels = [];
    const values = [];

    for (let i = 0; i < l2MainContext.length && i < MAX_DISPLAY_ITEMS; i += step) {
      const item = l2MainContext[i];
      if (!item?.timestamp) continue;
      labels.push(new Date(item.timestamp));

      if (view === "energy") {
        values.push(item.consumedEnergy || 0);
      } else {
        values.push(item.power || 0); // Make sure your data includes 'power'
      }
    }

    const color = view === "energy" ? "#3b82f6" : "#f97316";

    const data = {
      labels,
      datasets: [
        {
          label: view === "energy" ? "Consumed Energy (kWh)" : "Power (kW)",
          data: values,
          borderColor: color,
          pointRadius: 1,
          pointHoverRadius: 3,
          pointBackgroundColor: color,
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, view === "energy" ? "rgba(59,130,246,0.3)" : "rgba(249,115,22,0.3)");
            gradient.addColorStop(1, "rgba(255,255,255,0)");
            return gradient;
          },
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: view === "energy" ? "Energy Consumption Over Time" : "Power Output Over Time",
          color: "#1f2937",
          font: { size: 18, weight: "bold", family: "'Inter', sans-serif" },
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(31, 41, 55, 0.9)",
          titleFont: { size: 13 },
          bodyFont: { size: 12 },
          callbacks: {
            label: (ctx) => `${ctx.parsed.y.toFixed(2)} ${view === "energy" ? "kWh" : "kW"}`,
          },
        },
        legend: { display: false },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "minute",
            displayFormats: { minute: "HH:mm" },
            locale: enUS,
          },
          title: {
            display: true,
            text: "Time",
            color: "#6b7280",
            font: { size: 12 },
          },
          ticks: {
            color: "#6b7280",
            font: { size: 10 },
            maxTicksLimit: 6,
          },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: view === "energy" ? "Energy (kWh)" : "Power (kW)",
            color: "#6b7280",
            font: { size: 12 },
          },
          ticks: {
            color: "#6b7280",
            font: { size: 10 },
            callback: (value) => `${Number(value).toFixed(1)}`,
          },
          grid: {
            color: "rgba(203, 213, 225, 0.2)",
            drawBorder: false,
          },
        },
      },
    };

    return { chartData: data, chartOptions: options };
  }, [l2MainContext, view]);

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
        {l2MainState.map((state, index) => (
          <motion.div
            key={index}
            className="flex justify-between items-center"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">{state.timestamp}</span>
            <div className="space-x-2">
              <StatusBadge status={state.heartbeat} />
              <StatusBadge status={state.meterValues} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Energy/Power Graph Section */}
      <div className="flex justify-between items-center mt-6 mb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {view === "energy" ? "Energy Graph" : "Power Graph"}
        </h2>
        <Button variant="outline" onClick={toggleView}>
          Switch to {view === "energy" ? "Power" : "Energy"}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl shadow-inner"
      >
        {l2MainContext.length > 0 ? (
          <div style={{ height: "350px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No energy data available to display.</p>
        )}
        {l2MainContext.length >= MAX_DISPLAY_ITEMS && (
          <p className="text-sm text-gray-400 mt-2">
            Displaying {MAX_DISPLAY_ITEMS} of {l2MainContext.length.toLocaleString()} data points for performance.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

export default StatusContext;
