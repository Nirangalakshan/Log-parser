"use client";

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend);

function MetricsChart({ metricsData }) {
  const chartData = {
    labels: metricsData.map((m) => m.timestamp),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: metricsData.map((m) => m.cpuUsage),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Memory Usage (%)',
        data: metricsData.map((m) => m.memoryUsage),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Temperature (°C)',
        data: metricsData.map((m) => m.temperature),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'EV Charger Metrics',
        color: '#ffffff',
      },
      legend: {
        labels: {
          color: '#ffffff',
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'HH:mm',
          },
          locale: enUS, // Explicitly set locale to en-US
        },
        title: {
          display: true,
          text: 'Time',
          color: '#ffffff',
        },
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
          color: '#ffffff',
        },
        ticks: {
          color: '#ffffff',
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow" suppressHydrationWarning>
      <h2 className="text-xl font-semibold mb-2">System Metrics</h2>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default MetricsChart;