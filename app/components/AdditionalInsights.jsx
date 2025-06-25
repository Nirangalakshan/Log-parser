// "use client";

// import { Line } from "react-chartjs-2";
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

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// export default function AdditionalInsights({ l2Data, metricsData }) {
//   const data = {
//     labels: l2Data.map((d) => d.timestamp),
//     datasets: [
//       {
//         label: "Voltage (V)",
//         data: l2Data.map((d) => d.voltage || 0),
//         borderColor: "#3b82f6",
//         backgroundColor: "rgba(59, 130, 246, 0.2)",
//         tension: 0.1,
//       },
//       {
//         label: "Current (A)",
//         data: l2Data.map((d) => d.current || 0),
//         borderColor: "#10b981",
//         backgroundColor: "rgba(16, 185, 129, 0.2)",
//         tension: 0.1,
//       },
//       {
//         label: "Current Energy (Wh)",
//         data: l2Data.map((d) => d.currentEnergy || 0),
//         borderColor: "#ef4444",
//         backgroundColor: "rgba(239, 68, 68, 0.2)",
//         tension: 0.1,
//       },
//       {
//         label: "Power (W)",
//         data: l2Data.map((d) => d.power || 0),
//         borderColor: "#8b5cf6",
//         backgroundColor: "rgba(139, 92, 246, 0.2)",
//         tension: 0.1,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { position: "top" },
//       title: { display: true, text: "Charging Parameters Over Time" },
//     },
//     scales: {
//       x: { title: { display: true, text: "Timestamp" } },
//       y: { title: { display: true, text: "Value" }, beginAtZero: true },
//     },
//   };

//   return (
//     <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
//       <Line data={data} options={options} />
//     </div>
//   );
// }






"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdditionalInsights({ l2Data, metricsData }) {
  const data = {
    labels: l2Data.map((d) => d.timestamp),
    datasets: [
      {
        label: "Voltage (V)",
        data: l2Data.map((d) => d.voltage || 0),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 1, // thinner line
        pointRadius: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Current (A)",
        data: l2Data.map((d) => d.current || 0),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 1,
        pointRadius: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Current Energy (Wh)",
        data: l2Data.map((d) => d.currentEnergy || 0),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 1,
        pointRadius: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: "Power (W)",
        data: l2Data.map((d) => d.power || 0),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 1,
        pointRadius: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#6b7280",
          boxWidth: 12,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Charging Parameters Over Time",
        color: "#111827",
        font: {
          size: 18,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Timestamp",
          color: "#4b5563",
        },
        ticks: {
          color: "#6b7280",
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
          color: "#4b5563",
        },
        ticks: {
          color: "#6b7280",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6">
      <Line data={data} options={options} />
    </div>
  );
}
