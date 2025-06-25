// "use client";

// import React from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { motion, AnimatePresence } from "framer-motion";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   TimeScale,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import "chartjs-adapter-date-fns";
// import { enUS } from "date-fns/locale";
// import { Tooltip as ReactTooltip } from "react-tooltip";
// import ChargingDonuts from "../charts/ChargingDonuts";


// ChartJS.register(
//   BarElement,
//   CategoryScale,
//   LinearScale,
//   TimeScale,
//   Title,
//   Tooltip,
//   Legend
// );

// function ChargingMetrics({ l2Data }) {
//   // Log l2Data for debugging
//   console.log("ChargingMetrics l2Data:", l2Data);

//   // Validate l2Data: accept entries with at least one valid metric
//   const validData = Array.isArray(l2Data)
//     ? l2Data
//         .map((d, index) => {
//           const isValid =
//             d &&
//             typeof d.timestamp === "string" &&
//             ["voltage", "current", "power", "energy"].some(
//               (key) => d[key] !== undefined && !isNaN(Number(d[key]))
//             );
//           if (!isValid) {
//             console.warn(`Invalid data at index ${index}:`, d);
//           }
//           return isValid ? { ...d } : null;
//         })
//         .filter(Boolean)
//     : [];

//   // Log validData for debugging
//   console.log("ChargingMetrics validData:", validData);

//   // Latest data for circular progress bars
//   const latestData =
//     validData.length > 0
//       ? {
//           voltage: Number(validData[validData.length - 1].voltage) || 0,
//           current: Number(validData[validData.length - 1].current) || 0,
//           power: Number(validData[validData.length - 1].power) || 0,
//           energy: Number(validData[validData.length - 1].energy) || 0,
//         }
//       : { voltage: 0, current: 0, power: 0, energy: 0 };

//   // Summary calculations
//   const summary = {
//     voltage: {
//       avg: validData.length
//         ? (
//             validData.reduce((sum, d) => sum + (Number(d.voltage) || 0), 0) /
//             validData.length
//           ).toFixed(2)
//         : "0.00",
//       min: validData.length
//         ? Math.min(
//             ...validData.map((d) => Number(d.voltage) || Infinity)
//           ).toFixed(2)
//         : "0.00",
//       max: validData.length
//         ? Math.max(
//             ...validData.map((d) => Number(d.voltage) || -Infinity)
//           ).toFixed(2)
//         : "0.00",
//     },
//     current: {
//       avg: validData.length
//         ? (
//             validData.reduce((sum, d) => sum + (Number(d.current) || 0), 0) /
//             validData.length
//           ).toFixed(2)
//         : "0.00",
//       min: validData.length
//         ? Math.min(
//             ...validData.map((d) => Number(d.current) || Infinity)
//           ).toFixed(2)
//         : "0.00",
//       max: validData.length
//         ? Math.max(
//             ...validData.map((d) => Number(d.current) || -Infinity)
//           ).toFixed(2)
//         : "0.00",
//     },
//     power: {
//       avg: validData.length
//         ? (
//             validData.reduce((sum, d) => sum + (Number(d.power) || 0), 0) /
//             validData.length
//           ).toFixed(3)
//         : "0.000",
//       min: validData.length
//         ? Math.min(
//             ...validData.map((d) => Number(d.power) || Infinity)
//           ).toFixed(3)
//         : "0.000",
//       max: validData.length
//         ? Math.max(
//             ...validData.map((d) => Number(d.power) || -Infinity)
//           ).toFixed(3)
//         : "0.000",
//     },
//     energy: {
//       avg: validData.length
//         ? (
//             validData.reduce((sum, d) => sum + (Number(d.energy) || 0), 0) /
//             validData.length
//           ).toFixed(2)
//         : "0.00",
//       min: validData.length
//         ? Math.min(
//             ...validData.map((d) => Number(d.energy) || Infinity)
//           ).toFixed(2)
//         : "0.00",
//       max: validData.length
//         ? Math.max(
//             ...validData.map((d) => Number(d.energy) || -Infinity)
//           ).toFixed(2)
//         : "0.00",
//     },
//   };

//   const normalize = (value, max) =>
//     Math.min(((Number(value) || 0) / max) * 100, 100);
//   const circularMetrics = [
//     {
//       label: "Voltage (V)",
//       value: latestData.voltage.toFixed(2),
//       max: 500,
//       color: "#2dd4bf",
//     },
//     {
//       label: "Current (A)",
//       value: latestData.current.toFixed(2),
//       max: 100,
//       color: "#10b981",
//     },
//     {
//       label: "Power (kW)",
//       value: latestData.power.toFixed(3),
//       max: 50,
//       color: "#ef4444",
//     },
//     {
//       label: "Energy (kWh)",
//       value: latestData.energy.toFixed(2),
//       max: 100,
//       color: "#fb7185",
//     },
//   ];

//   const barData = {
//     labels: validData.map((d) => d.timestamp || ""),
//     datasets: [
//       {
//         label: "Voltage (V)",
//         data: validData.map((d) => Number(d.voltage) || 0),
//         backgroundColor: "rgba(45, 212, 191, 0.6)",
//         borderColor: "#2dd4bf",
//         borderWidth: 1,
//       },
//       {
//         label: "Current (A)",
//         data: validData.map((d) => Number(d.current) || 0),
//         backgroundColor: "rgba(16, 185, 129, 0.6)",
//         borderColor: "#10b981",
//         borderWidth: 1,
//       },
//       {
//         label: "Power (kW)",
//         data: validData.map((d) => Number(d.power) || 0),
//         backgroundColor: "rgba(239, 68, 68, 0.6)",
//         borderColor: "#ef4444",
//         borderWidth: 1,
//       },
//       {
//         label: "Energy (kWh)",
//         data: validData.map((d) => Number(d.energy) || 0),
//         backgroundColor: "rgba(251, 113, 133, 0.6)",
//         borderColor: "#fb7185",
//         borderWidth: 1,
//       },
//     ],
//   };

//   const barOptions = {
//     responsive: true,
//     plugins: {
//       title: {
//         display: true,
//         text: "Charging Metrics Over Time",
//         color: "#1f2937",
//         font: { size: 16, family: "Inter" },
//       },
//       legend: {
//         labels: { color: "#1f2937", font: { family: "Inter" } },
//       },
//     },
//     scales: {
//       x: {
//         type: "time",
//         time: {
//           unit: "minute",
//           displayFormats: {
//             minute: "HH:mm",
//           },
//           locale: enUS,
//         },
//         title: {
//           display: true,
//           text: "Time",
//           color: "#1f2937",
//           font: { size: 12, family: "Inter" },
//         },
//         ticks: {
//           color: "#1f2937",
//           maxTicksLimit: 6,
//         },
//       },
//       y: {
//         title: {
//           display: true,
//           text: "Value",
//           color: "#1f2937",
//           font: { size: 12, family: "Inter" },
//         },
//         ticks: {
//           color: "#1f2937",
//         },
//       },
//     },
//   };

//   const exportSummaryAsPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text("Charging Metrics Summary", 14, 20);

//     autoTable(doc, {
//       startY: 30,
//       head: [["Metric", "Average", "Min", "Max"]],
//       body: [
//         [
//           "Voltage (V)",
//           summary.voltage.avg,
//           summary.voltage.min,
//           summary.voltage.max,
//         ],
//         [
//           "Current (A)",
//           summary.current.avg,
//           summary.current.min,
//           summary.current.max,
//         ],
//         ["Power (kW)", summary.power.avg, summary.power.min, summary.power.max],
//         [
//           "Energy (kWh)",
//           summary.energy.avg,
//           summary.energy.min,
//           summary.energy.max,
//         ],
//       ],
//     });

//     doc.save("charging_summary.pdf");
//   };

//   if (!validData.length) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="bg-gradient-card dark:bg-dark-gradient-card p-6 rounded-2xl shadow-neumorphic dark:shadow-dark-neumorphic max-h-[400px] overflow-y-auto hover:shadow-xl transition-all duration-300"
//         suppressHydrationWarning
//       >
//         <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white sticky top-0 bg-gradient-card dark:bg-dark-gradient-card z-10">
//           Charging Metrics
//         </h2>
//         <p className="text-sm text-gray-600 dark:text-gray-400">
//           No valid charging data available. Check log file or Dashboard parsing.
//         </p>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//       className="bg-gradient-card dark:bg-dark-gradient-card p-6 rounded-2xl shadow-neumorphic dark:shadow-dark-neumorphic max-h-[400px] overflow-y-auto hover:shadow-xl transition-all duration-300"
//       suppressHydrationWarning
//     >
//       <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white sticky top-0 bg-gradient-card dark:bg-dark-gradient-card z-10">
//         Charging Metrics
//       </h2>
//       <ChargingDonuts data={validData} />

//       <h3 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-400 sticky top-0 bg-gradient-card dark:bg-dark-gradient-card z-10">
//         Metrics Summary
//       </h3>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="mb-6"
//       >
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
//               <th className="p-2 text-left text-gray-800 dark:text-white">
//                 Metric
//               </th>
//               <th className="p-2 text-left text-gray-800 dark:text-white">
//                 Average
//               </th>
//               <th className="p-2 text-left text-gray-800 dark:text-white">
//                 Min
//               </th>
//               <th className="p-2 text-left text-gray-800 dark:text-white">
//                 Max
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className="border-t border-gray-200 dark:border-gray-800">
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 Voltage (V)
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.voltage.avg}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.voltage.min}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.voltage.max}
//               </td>
//             </tr>
//             <tr className="border-t border-gray-200 dark:border-gray-800">
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 Current (A)
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.current.avg}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.current.min}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.current.max}
//               </td>
//             </tr>
//             <tr className="border-t border-gray-200 dark:border-gray-800">
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 Power (kW)
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.power.avg}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.power.min}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.power.max}
//               </td>
//             </tr>
//             <tr className="border-t border-gray-200 dark:border-gray-800">
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 Energy (kWh)
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.energy.avg}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.energy.min}
//               </td>
//               <td className="p-2 text-gray-600 dark:text-gray-300">
//                 {summary.energy.max}
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </motion.div>
//        <motion.button
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={exportSummaryAsPDF}
//         className="mb-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-md hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium"
//       >
//         Download Summary as PDF
//       </motion.button>
//     </motion.div>
//   );
// }

// export default ChargingMetrics;





"use client";

import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

function ChargingMetrics({ l2Data = [] }) {
  const validData = Array.isArray(l2Data)
    ? l2Data
        .map((d, i) => {
          const isValid =
            d &&
            typeof d.timestamp === "string" &&
            ["voltage", "current", "power", "energy"].some(
              (key) => d[key] !== undefined && !isNaN(Number(d[key]))
            );
          return isValid ? { ...d } : null;
        })
        .filter(Boolean)
    : [];

  const summary = {
    voltage: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + Number(d.voltage || 0), 0) /
            validData.length
          ).toFixed(2)
        : "0.00",
      min: validData.length
        ? Math.min(...validData.map((d) => Number(d.voltage) || Infinity)).toFixed(2)
        : "0.00",
      max: validData.length
        ? Math.max(...validData.map((d) => Number(d.voltage) || -Infinity)).toFixed(2)
        : "0.00",
    },
    current: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + Number(d.current || 0), 0) /
            validData.length
          ).toFixed(2)
        : "0.00",
      min: validData.length
        ? Math.min(...validData.map((d) => Number(d.current) || Infinity)).toFixed(2)
        : "0.00",
      max: validData.length
        ? Math.max(...validData.map((d) => Number(d.current) || -Infinity)).toFixed(2)
        : "0.00",
    },
    power: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + Number(d.power || 0), 0) /
            validData.length
          ).toFixed(2)
        : "0.00",
      min: validData.length
        ? Math.min(...validData.map((d) => Number(d.power) || Infinity)).toFixed(2)
        : "0.00",
      max: validData.length
        ? Math.max(...validData.map((d) => Number(d.power) || -Infinity)).toFixed(2)
        : "0.00",
    },
    energy: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + Number(d.energy || 0), 0) /
            validData.length
          ).toFixed(2)
        : "0.00",
      min: validData.length
        ? Math.min(...validData.map((d) => Number(d.energy) || Infinity)).toFixed(2)
        : "0.00",
      max: validData.length
        ? Math.max(...validData.map((d) => Number(d.energy) || -Infinity)).toFixed(2)
        : "0.00",
    },
  };

  const metrics = [
    {
      key: "voltage",
      label: "Voltage (V)",
      avg: parseFloat(summary.voltage.avg),
      color: "#2dd4bf",
      max: 500,
    },
    {
      key: "current",
      label: "Current (A)",
      avg: parseFloat(summary.current.avg),
      color: "#10b981",
      max: 100,
    },
    {
      key: "power",
      label: "Power (kW)",
      avg: parseFloat(summary.power.avg),
      color: "#ef4444",
      max: 50,
    },
    {
      key: "energy",
      label: "Energy (kWh)",
      avg: parseFloat(summary.energy.avg),
      color: "#fb7185",
      max: 4500,
    },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Charging Metrics Summary", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Metric", "Average", "Min", "Max"]],
      body: [
        ["Voltage (V)", summary.voltage.avg, summary.voltage.min, summary.voltage.max],
        ["Current (A)", summary.current.avg, summary.current.min, summary.current.max],
        ["Power (kW)", summary.power.avg, summary.power.min, summary.power.max],
        ["Energy (kWh)", summary.energy.avg, summary.energy.min, summary.energy.max],
      ],
    });
    doc.save("charging_summary.pdf");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Charging Metrics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const spring = useSpring({
            from: { value: 0 },
            to: { value: (metric.avg / metric.max) * 100 },
            config: { duration: 1500 },
          });

          return (
            <div
              key={metric.key}
              className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner"
            >
              <div className="relative w-[200px] h-[200px]">
                <svg width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                    fill="none"
                  />
                  <animated.circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke={metric.color}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray="565"
                    strokeDashoffset={spring.value.to((v) => 565 - (565 * v) / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                  <text
                    x="100"
                    y="105"
                    textAnchor="middle"
                    className="fill-current text-lg font-semibold"
                    fill="#111"
                  >
                    {metric.avg.toFixed(2)}
                  </text>
                  <text
                    x="100"
                    y="125"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#666"
                  >
                    {metric.label}
                  </text>
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="text-left p-2">Metric</th>
              <th className="text-left p-2">Average</th>
              <th className="text-left p-2">Min</th>
              <th className="text-left p-2">Max</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300">
            {["voltage", "current", "power", "energy"].map((key) => (
              <tr key={key} className="border-t dark:border-gray-800">
                <td className="p-2 capitalize">{key}</td>
                <td className="p-2">{summary[key].avg}</td>
                <td className="p-2">{summary[key].min}</td>
                <td className="p-2">{summary[key].max}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={exportPDF}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
      >
        Download PDF
      </button>
    </motion.div>
  );
}

export default ChargingMetrics;
