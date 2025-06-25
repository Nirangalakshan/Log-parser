"use client";

import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  Label,
} from "recharts";

function SystemMetrics({ metricsData }) {
  // Defensive fallback for empty or undefined metricsData
  const validData = Array.isArray(metricsData) ? metricsData : [];

  // Calculate latest and summaries safely
  const latest = validData[validData.length - 1] || {
    cpuUsage: 0,
    memoryUsage: 0,
    temperature: 0,
  };

  // Summary calculations for System Metrics
  const summary = {
    cpuUsage: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + (d.cpuUsage || 0), 0) /
            validData.length
          ).toFixed(1)
        : "0.0",
      min: validData.length
        ? Math.min(...validData.map((d) => d.cpuUsage || Infinity)).toFixed(1)
        : "0.0",
      max: validData.length
        ? Math.max(...validData.map((d) => d.cpuUsage || -Infinity)).toFixed(1)
        : "0.0",
    },
    memoryUsage: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + (d.memoryUsage || 0), 0) /
            validData.length
          ).toFixed(1)
        : "0.0",
      min: validData.length
        ? Math.min(...validData.map((d) => d.memoryUsage || Infinity)).toFixed(1)
        : "0.0",
      max: validData.length
        ? Math.max(...validData.map((d) => d.memoryUsage || -Infinity)).toFixed(1)
        : "0.0",
    },
    temperature: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + (d.temperature || 0), 0) /
            validData.length
          ).toFixed(1)
        : "0.0",
      min: validData.length
        ? Math.min(...validData.map((d) => d.temperature || Infinity)).toFixed(1)
        : "0.0",
      max: validData.length
        ? Math.max(...validData.map((d) => d.temperature || -Infinity)).toFixed(1)
        : "0.0",
    },
  };

  const metrics = [
    {
      key: "cpu",
      label: "CPU Usage",
      value: summary.cpuUsage.avg,
      unit: "%",
      fill: "#3b82f6", // blue
    },
    {
      key: "memory",
      label: "Memory Usage",
      value: summary.memoryUsage.avg,
      unit: "%",
      fill: "#10b981", // green
    },
    {
      key: "temp",
      label: "Temperature",
      value: summary.temperature.avg,
      unit: "°C",
      fill: "#ef4444", // red
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">System Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric) => {
          const chartData = [
            {
              name: metric.label,
              value: Number(metric.value),
              fill: metric.fill,
            },
          ];

          return (
            <div
              key={metric.key}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
            >
              <h3 className="font-semibold text-lg">{metric.label}</h3>
              <RadialBarChart
                width={200}
                height={200}
                data={chartData}
                innerRadius={70}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  fill={metric.fill}
                  background
                  cornerRadius={15}
                />
                <PolarRadiusAxis tick={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) =>
                      viewBox && "cx" in viewBox && "cy" in viewBox ? (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-gray-800 text-3xl font-bold"
                        >
                          {metric.value}
                          <tspan
                            x={viewBox.cx}
                            dy="1.5em"
                            className="fill-gray-600 text-sm font-normal"
                          >
                            {metric.unit}
                          </tspan>
                        </text>
                      ) : null
                    }
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
              <div className="mt-2 text-sm text-gray-600">
                Based on average values
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <table className="w-full border-collapse border border-gray-300 mb-12">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Metric</th>
            <th className="border border-gray-300 p-2 text-left">Average</th>
            <th className="border border-gray-300 p-2 text-left">Min</th>
            <th className="border border-gray-300 p-2 text-left">Max</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary).map(([metric, values]) => (
            <tr key={metric} className="even:bg-gray-50">
              <td className="border border-gray-300 p-2 capitalize">{metric}</td>
              <td className="border border-gray-300 p-2">{values.avg}</td>
              <td className="border border-gray-300 p-2">{values.min}</td>
              <td className="border border-gray-300 p-2">{values.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChargingMetrics({ l2Data }) {
  // Defensive fallback for empty or undefined l2Data
  const validData = Array.isArray(l2Data) ? l2Data : [];

  // Summary calculations
  const summary = {
    voltage: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + (Number(d.voltage) || 0), 0) /
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
            validData.reduce((sum, d) => sum + (Number(d.current) || 0), 0) /
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
            validData.reduce((sum, d) => sum + (Number(d.power) || 0), 0) /
            validData.length
          ).toFixed(3)
        : "0.000",
      min: validData.length
        ? Math.min(...validData.map((d) => Number(d.power) || Infinity)).toFixed(3)
        : "0.000",
      max: validData.length
        ? Math.max(...validData.map((d) => Number(d.power) || -Infinity)).toFixed(3)
        : "0.000",
    },
    energy: {
      avg: validData.length
        ? (
            validData.reduce((sum, d) => sum + (Number(d.energy) || 0), 0) /
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

  const circularMetrics = [
    {
      label: "Voltage (V)",
      value: Number(summary.voltage.avg),
      max: 500,
      color: "#2dd4bf",
    },
    {
      label: "Current (A)",
      value: Number(summary.current.avg),
      max: 100,
      color: "#10b981",
    },
    {
      label: "Power (kW)",
      value: Number(summary.power.avg),
      max: 50,
      color: "#ef4444",
    },
    {
      label: "Energy (kWh)",
      value: Number(summary.energy.avg),
      max: 100,
      color: "#fb7185",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Charging Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {circularMetrics.map((metric) => {
          const data = [{ name: metric.label, value: metric.value, fill: metric.color }];
          return (
            <div
              key={metric.label}
              className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
            >
              <h3 className="font-semibold text-lg text-center">{metric.label}</h3>
              <RadialBarChart
                width={200}
                height={200}
                data={data}
                innerRadius={70}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  fill={metric.color}
                  background
                  cornerRadius={15}
                />
                <PolarRadiusAxis tick={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) =>
                      viewBox && "cx" in viewBox && "cy" in viewBox ? (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-gray-800 text-3xl font-bold"
                        >
                          {metric.value.toFixed(2)}
                          <tspan
                            x={viewBox.cx}
                            dy="1.5em"
                            className="fill-gray-600 text-sm font-normal"
                          >
                            {metric.label.split(" ")[1]}
                          </tspan>
                        </text>
                      ) : null
                    }
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </div>
          );
        })}
      </div>

      {/* Summary Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Metric</th>
            <th className="border border-gray-300 p-2 text-left">Average</th>
            <th className="border border-gray-300 p-2 text-left">Min</th>
            <th className="border border-gray-300 p-2 text-left">Max</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary).map(([metric, values]) => (
            <tr key={metric} className="even:bg-gray-50">
              <td className="border border-gray-300 p-2 capitalize">{metric}</td>
              <td className="border border-gray-300 p-2">{values.avg}</td>
              <td className="border border-gray-300 p-2">{values.min}</td>
              <td className="border border-gray-300 p-2">{values.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MetricsDashboard({ systemMetricsData, chargingMetricsData }) {
  // These props should be arrays of data objects
  // systemMetricsData example: [{ cpuUsage: 50, memoryUsage: 60, temperature: 40 }, ...]
  // chargingMetricsData example: [{ voltage: 230, current: 20, power: 3.5, energy: 10.5 }, ...]

  // Helper function to export full summary PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Metrics Summary Report", 14, 20);

    // System Metrics Table
    doc.setFontSize(14);
    doc.text("System Metrics Summary", 14, 30);

    const systemSummary = calculateSystemSummary(systemMetricsData);
    const chargingSummary = calculateChargingSummary(chargingMetricsData);

    const systemTable = autoTable(doc, {
      startY: 35,
      head: [["Metric", "Average", "Min", "Max"]],
      body: Object.entries(systemSummary).map(([metric, vals]) => [
        metric,
        vals.avg,
        vals.min,
        vals.max,
      ]),
    });

    const afterSystemY = (systemTable.finalY || 35) + 15;

    // Charging Metrics Table
    doc.setFontSize(14);
    doc.text("Charging Metrics Summary", 14, afterSystemY);

    autoTable(doc, {
      startY: afterSystemY + 5,
      head: [["Metric", "Average", "Min", "Max"]],
      body: Object.entries(chargingSummary).map(([metric, vals]) => [
        metric,
        vals.avg,
        vals.min,
        vals.max,
      ]),
    });

    doc.save("metrics_summary_report.pdf");
  };

  // Helper functions to calculate summary objects for PDF export
  function calculateSystemSummary(data) {
    const validData = Array.isArray(data) ? data : [];
    return {
      cpuUsage: {
        avg: validData.length
          ? (
              validData.reduce((sum, d) => sum + (d.cpuUsage || 0), 0) /
              validData.length
            ).toFixed(1)
          : "0.0",
        min: validData.length
          ? Math.min(...validData.map((d) => d.cpuUsage || Infinity)).toFixed(1)
          : "0.0",
        max: validData.length
          ? Math.max(...validData.map((d) => d.cpuUsage || -Infinity)).toFixed(1)
          : "0.0",
      },
      memoryUsage: {
        avg: validData.length
          ? (
              validData.reduce((sum, d) => sum + (d.memoryUsage || 0), 0) /
              validData.length
            ).toFixed(1)
          : "0.0",
        min: validData.length
          ? Math.min(...validData.map((d) => d.memoryUsage || Infinity)).toFixed(1)
          : "0.0",
        max: validData.length
          ? Math.max(...validData.map((d) => d.memoryUsage || -Infinity)).toFixed(1)
          : "0.0",
      },
      temperature: {
        avg: validData.length
          ? (
              validData.reduce((sum, d) => sum + (d.temperature || 0), 0) /
              validData.length
            ).toFixed(1)
          : "0.0",
        min: validData.length
          ? Math.min(...validData.map((d) => d.temperature || Infinity)).toFixed(1)
          : "0.0",
        max: validData.length
          ? Math.max(...validData.map((d) => d.temperature || -Infinity)).toFixed(1)
          : "0.0",
      },
    };
  }

  function calculateChargingSummary(data) {
    const validData = Array.isArray(data) ? data : [];
    return {
      voltage: {
        avg: validData.length
          ? (
              validData.reduce((sum, d) => sum + (Number(d.voltage) || 0), 0) /
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
              validData.reduce((sum, d) => sum + (Number(d.current) || 0), 0) /
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
              validData.reduce((sum, d) => sum + (Number(d.power) || 0), 0) /
              validData.length
            ).toFixed(3)
          : "0.000",
        min: validData.length
          ? Math.min(...validData.map((d) => Number(d.power) || Infinity)).toFixed(3)
          : "0.000",
        max: validData.length
          ? Math.max(...validData.map((d) => Number(d.power) || -Infinity)).toFixed(3)
          : "0.000",
      },
      energy: {
        avg: validData.length
          ? (
              validData.reduce((sum, d) => sum + (Number(d.energy) || 0), 0) /
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
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SystemMetrics metricsData={systemMetricsData} />
      <ChargingMetrics l2Data={chargingMetricsData} />

      <button
        onClick={exportPDF}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Export Full Summary PDF
      </button>
    </div>
  );
}
