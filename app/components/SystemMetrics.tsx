//for previous log file
// "use client";

// import { TrendingUp } from "lucide-react";
// import {
//   RadialBarChart,
//   RadialBar,
//   PolarRadiusAxis,
//   Label,
// } from "recharts";

// export default function SystemMetrics({ metricsData }) {
//   const latest = metricsData[metricsData.length - 1] || {
//     cpuUsage: 0,
//     memoryUsage: 0,
//     temperature: 0,
//   };

//   const getStats = (key) => {
//     const values = metricsData.map((item) => item[key]).filter((v) => typeof v === "number");
//     if (!values.length) return { min: 0, max: 0, avg: 0 };

//     const min = Math.min(...values);
//     const max = Math.max(...values);
//     const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

//     return {
//       min,
//       max,
//       avg,
//     };
//   };

//   const metrics = [
//     {
//       key: "cpuUsage",
//       label: "CPU Usage",
//       unit: "%",
//       fill: "#3b82f6", // blue
//       stats: getStats("cpuUsage"),
//       latest: latest.cpuUsage.toFixed(1),
//     },
//     {
//       key: "memoryUsage",
//       label: "Memory Usage",
//       unit: "%",
//       fill: "#10b981", // green
//       stats: getStats("memoryUsage"),
//       latest: latest.memoryUsage.toFixed(1),
//     },
//     {
//       key: "temperature",
//       label: "Temperature",
//       unit: "°C",
//       fill: "#ef4444", // red
//       stats: getStats("temperature"),
//       latest: latest.temperature.toFixed(1),
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       {metrics.map((metric) => {
//         const chartData = [
//           {
//             name: metric.label,
//             value: metric.stats.avg,
//             fill: metric.fill,
//           },
//         ];

//         return (
//           <div key={metric.key} className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex flex-col">
//             {/* Header */}
//             <div className="text-center mb-2">
//               <h2 className="text-xl font-semibold">{metric.label}</h2>
//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Latest: {metric.latest} {metric.unit} • Avg: {metric.stats.avg} {metric.unit}
//               </p>
//             </div>

//             {/* Radial Chart */}
//             <div className="flex justify-center">
//               <RadialBarChart
//                 width={250}
//                 height={250}
//                 data={chartData}
//                 innerRadius={80}
//                 outerRadius={140}
//                 startAngle={90}
//                 endAngle={-270}
//               >
//                 <RadialBar dataKey="value" fill={metric.fill} background />
//                 <PolarRadiusAxis tick={false} axisLine={false}>
//                   <Label
//                     content={({ viewBox }) => {
//                       if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                         return (
//                           <text
//                             x={viewBox.cx}
//                             y={viewBox.cy}
//                             textAnchor="middle"
//                             dominantBaseline="middle"
//                           >
//                             <tspan
//                               x={viewBox.cx}
//                               y={viewBox.cy}
//                               className="fill-foreground text-4xl font-bold"
//                             >
//                               {metric.stats.avg.toFixed(1)}
//                             </tspan>
//                             <tspan
//                               x={viewBox.cx}
//                               y={(viewBox.cy || 0) + 24}
//                               className="fill-muted-foreground text-base"
//                             >
//                               {metric.unit}
//                             </tspan>
//                           </text>
//                         );
//                       }
//                       return null;
//                     }}
//                   />
//                 </PolarRadiusAxis>
//               </RadialBarChart>
//             </div>

//             {/* Footer */}
//             <div className="flex flex-col items-center mt-4 gap-1 text-sm">
//               <div className="flex items-center gap-2 font-medium text-green-600">
//                 Stable Performance <TrendingUp className="h-4 w-4" />
//               </div>
//               <div className="text-gray-500 dark:text-gray-400">
//                 Based on full log history
//               </div>
//             </div>

//             {/* Stats Table */}
//             <div className="mt-4 px-2 text-sm text-gray-700 dark:text-gray-300">
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="text-xs uppercase text-gray-500 dark:text-gray-400 border-b">
//                     <th className="pb-1">Min</th>
//                     <th className="pb-1">Max</th>
//                     <th className="pb-1">Avg</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="text-sm">
//                     <td>{metric.stats.min.toFixed(1)} {metric.unit}</td>
//                     <td>{metric.stats.max.toFixed(1)} {metric.unit}</td>
//                     <td>{metric.stats.avg.toFixed(1)} {metric.unit}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }




//for newone
"use client";

import { TrendingUp } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  Label,
} from "recharts";

export default function SystemMetrics({ metricsData }) {
  const latest = metricsData[metricsData.length - 1] || {
    cpuUsage: 0,
    memoryUsage: 0,
    cpuTemperature: 0, // Updated to match 'cpuTemperature' from log
  };

  const getStats = (key) => {
    const values = metricsData.map((item) => item[key]).filter((v) => typeof v === "number");
    if (!values.length) return { min: 0, max: 0, avg: 0 };

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

    return {
      min,
      max,
      avg,
    };
  };

  const metrics = [
    {
      key: "cpuUsage",
      label: "CPU Usage",
      unit: "%",
      fill: "#3b82f6", // blue
      stats: getStats("cpuUsage"),
      latest: latest.cpuUsage.toFixed(1),
    },
    {
      key: "memoryUsage",
      label: "Memory Usage",
      unit: "%",
      fill: "#10b981", // green
      stats: getStats("memoryUsage"),
      latest: latest.memoryUsage.toFixed(1),
    },
    {
      key: "cpuTemperature", // Updated from 'temperature'
      label: "Temperature",
      unit: "°C",
      fill: "#ef4444", // red
      stats: getStats("cpuTemperature"), // Updated to 'cpuTemperature'
      latest: latest.cpuTemperature.toFixed(1), // Updated to 'cpuTemperature'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric) => {
        const chartData = [
          {
            name: metric.label,
            value: metric.stats.avg,
            fill: metric.fill,
          },
        ];

        return (
          <div key={metric.key} className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex flex-col">
            {/* Header */}
            <div className="text-center mb-2">
              <h2 className="text-xl font-semibold">{metric.label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest: {metric.latest} {metric.unit} • Avg: {metric.stats.avg} {metric.unit}
              </p>
            </div>

            {/* Radial Chart */}
            <div className="flex justify-center">
              <RadialBarChart
                width={250}
                height={250}
                data={chartData}
                innerRadius={80}
                outerRadius={140}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar dataKey="value" fill={metric.fill} background />
                <PolarRadiusAxis tick={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {metric.stats.avg.toFixed(1)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-base"
                            >
                              {metric.unit}
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center mt-4 gap-1 text-sm">
              <div className="flex items-center gap-2 font-medium text-green-600">
                Stable Performance <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                Based on full log history
              </div>
            </div>

            {/* Stats Table */}
            <div className="mt-4 px-2 text-sm text-gray-700 dark:text-gray-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 dark:text-gray-400 border-b">
                    <th className="pb-1">Min</th>
                    <th className="pb-1">Max</th>
                    <th className="pb-1">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-sm">
                    <td>{metric.stats.min.toFixed(1)} {metric.unit}</td>
                    <td>{metric.stats.max.toFixed(1)} {metric.unit}</td>
                    <td>{metric.stats.avg.toFixed(1)} {metric.unit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
