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
