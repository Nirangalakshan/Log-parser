// "use client";

// import { TrendingUp } from "lucide-react";
// import { useState } from "react";
// import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts";

// export default function SystemMetrics({ l2Data, l2MainContext }) {
//   // Derive power and join with l2MainContext for transactionId
//   const enrichedData = (l2Data || []).map(item => {
//     const context = l2MainContext && l2MainContext.find(c => c.timestamp === item.timestamp);
//     return {
//       ...item,
//       transactionId: context ? (context.transactionId || "N/A").toString() : "N/A",
//       power: item.currentEnergy ? item.currentEnergy * 0.5 : 0, // Placeholder: adjust logic
//     };
//   });

//   // Sort by transactionId initially
//   const [sortDirection, setSortDirection] = useState("asc");
//   const sortedData = [...enrichedData].sort((a, b) => {
//     const aId = (a.transactionId || "N/A").toString();
//     const bId = (b.transactionId || "N/A").toString();
//     if (sortDirection === "asc") {
//       return aId.localeCompare(bId);
//     }
//     return bId.localeCompare(aId);
//   });

//   // Toggle sort direction
//   const handleSort = () => {
//     setSortDirection(sortDirection === "asc" ? "desc" : "asc");
//   };

//   // Render nothing or a message if no data
//   if (sortedData.length === 0) {
//     return <div className="text-center text-gray-500 p-4">No data available to display.</div>;
//   }

//   return (
//     <div className="space-y-6">
//       {/* Table Section with Scrollable Area */}
//       <div className="overflow-x-auto">
//         <div className="max-h-64 overflow-y-auto border rounded-lg">
//           <table className="min-w-full bg-white dark:bg-gray-900 shadow">
//             <thead>
//               <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0">
//                 <th className="py-2 px-4 border-b text-left">Timestamp</th>
//                 <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={handleSort}>
//                   Transaction ID {sortDirection === "asc" ? "↑" : "↓"}
//                 </th>
//                 <th className="py-2 px-4 border-b text-left">Consumed Energy (kWh)</th>
//                 <th className="py-2 px-4 border-b text-left">Power (kW)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sortedData.map((item, index) => (
//                 <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                   <td className="py-2 px-4 border-b">{item.timestamp || "N/A"}</td>
//                   <td className="py-2 px-4 border-b">{item.transactionId}</td>
//                   <td className="py-2 px-4 border-b">{item.currentEnergy?.toFixed(2) || "0.00"}</td>
//                   <td className="py-2 px-4 border-b">{item.power?.toFixed(2) || "0.00"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Optional: Keep Radial Charts for Additional Insights */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {[
//           { key: "currentEnergy", label: "Consumed Energy", unit: "kWh", fill: "#3b82f6" },
//           { key: "power", label: "Power", unit: "kW", fill: "#10b981" },
//         ].map((metric) => {
//           const values = enrichedData.map(item => item[metric.key] || 0).filter(v => typeof v === "number");
//           const stats = values.length
//             ? {
//                 min: Math.min(...values),
//                 max: Math.max(...values),
//                 avg: values.reduce((sum, val) => sum + val, 0) / values.length,
//               }
//             : { min: 0, max: 0, avg: 0 };
//           const latest = (enrichedData[enrichedData.length - 1]?.[metric.key] || 0).toFixed(2);

//           const chartData = [{ name: metric.label, value: stats.avg, fill: metric.fill }];

//           return (
//             <div key={metric.key} className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex flex-col">
//               <div className="text-center mb-2">
//                 <h2 className="text-xl font-semibold">{metric.label}</h2>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   Latest: {latest} {metric.unit} • Avg: {stats.avg.toFixed(2)} {metric.unit}
//                 </p>
//               </div>
//               <div className="flex justify-center">
//                 <RadialBarChart
//                   width={250}
//                   height={250}
//                   data={chartData}
//                   innerRadius={80}
//                   outerRadius={140}
//                   startAngle={90}
//                   endAngle={-270}
//                 >
//                   <RadialBar dataKey="value" fill={metric.fill} background />
//                   <PolarRadiusAxis tick={false} axisLine={false}>
//                     <Label
//                       content={({ viewBox }) => {
//                         if (viewBox && "cx" in viewBox && "cy" in viewBox) {
//                           return (
//                             <text
//                               x={viewBox.cx}
//                               y={viewBox.cy}
//                               textAnchor="middle"
//                               dominantBaseline="middle"
//                             >
//                               <tspan
//                                 x={viewBox.cx}
//                                 y={viewBox.cy}
//                                 className="fill-foreground text-4xl font-bold"
//                               >
//                                 {stats.avg.toFixed(2)}
//                               </tspan>
//                               <tspan
//                                 x={viewBox.cx}
//                                 y={(viewBox.cy || 0) + 24}
//                                 className="fill-muted-foreground text-base"
//                               >
//                                 {metric.unit}
//                               </tspan>
//                             </text>
//                           );
//                         }
//                         return null;
//                       }}
//                     />
//                   </PolarRadiusAxis>
//                 </RadialBarChart>
//               </div>
//               <div className="flex flex-col items-center mt-4 gap-1 text-sm">
//                 <div className="flex items-center gap-2 font-medium text-green-600">
//                   Stable Performance <TrendingUp className="h-4 w-4" />
//                 </div>
//                 <div className="text-gray-500 dark:text-gray-400">
//                   Based on selected transaction
//                 </div>
//               </div>
//               <div className="mt-4 px-2 text-sm text-gray-700 dark:text-gray-300">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="text-xs uppercase text-gray-500 dark:text-gray-400 border-b">
//                       <th className="pb-1">Min</th>
//                       <th className="pb-1">Max</th>
//                       <th className="pb-1">Avg</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr className="text-sm">
//                       <td>{stats.min.toFixed(2)} {metric.unit}</td>
//                       <td>{stats.max.toFixed(2)} {metric.unit}</td>
//                       <td>{stats.avg.toFixed(2)} {metric.unit}</td>
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }








"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { RadialBarChart, RadialBar, PolarRadiusAxis, Label } from "recharts";

export default function SystemMetrics({ l2Data, l2MainContext }) {
  // Derive power and join with l2MainContext for transactionId and l2Data for state
  const enrichedData = (l2Data || []).map(item => {
    const context = l2MainContext && l2MainContext.find(c => c.timestamp === item.timestamp);
    const state = item.state || "N/A";
    console.log("Timestamp:", item.timestamp, "Context:", context, "State:", state, "State type:", typeof state);
    return {
      ...item,
      transactionId: context ? (context.transactionId || "N/A").toString() : "N/A",
      power: item.currentEnergy ? item.currentEnergy * 0.5 : 0, // Placeholder: adjust logic
      state: state, // Use state from l2Data
    };
  });

  // Sort by transactionId initially
  const [sortDirection, setSortDirection] = useState("asc");
  const sortedData = [...enrichedData].sort((a, b) => {
    const aId = (a.transactionId || "N/A").toString();
    const bId = (b.transactionId || "N/A").toString();
    if (sortDirection === "asc") {
      return aId.localeCompare(bId);
    }
    return bId.localeCompare(aId);
  });

  // Toggle sort direction
  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Render nothing or a message if no data
  if (sortedData.length === 0) {
    return <div className="text-center text-gray-500 p-4">No data available to display.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Table Section with Scrollable Area */}
      <div className="overflow-x-auto">
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          <table className="min-w-full bg-white dark:bg-gray-900 shadow">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                <th className="py-2 px-4 border-b text-left">Timestamp</th>
                <th className="py-2 px-4 border-b text-left cursor-pointer" onClick={handleSort}>
                  Transaction ID {sortDirection === "asc" ? "↑" : "↓"}
                </th>
                <th className="py-2 px-4 border-b text-left">State</th>
                <th className="py-2 px-4 border-b text-left">Consumed Energy (kWh)</th>
                <th className="py-2 px-4 border-b text-left">Power (kW)</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-2 px-4 border-b">{item.timestamp || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{item.transactionId}</td>
                  <td className="py-2 px-4 border-b">{item.state}</td>
                  <td className="py-2 px-4 border-b">{item.currentEnergy?.toFixed(2) || "0.00"}</td>
                  <td className="py-2 px-4 border-b">{item.power?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optional: Keep Radial Charts for Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: "currentEnergy", label: "Consumed Energy", unit: "kWh", fill: "#3b82f6" },
          { key: "power", label: "Power", unit: "kW", fill: "#10b981" },
        ].map((metric) => {
          const values = enrichedData.map(item => item[metric.key] || 0).filter(v => typeof v === "number");
          const stats = values.length
            ? {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: values.reduce((sum, val) => sum + val, 0) / values.length,
              }
            : { min: 0, max: 0, avg: 0 };
          const latest = (enrichedData[enrichedData.length - 1]?.[metric.key] || 0).toFixed(2);

          const chartData = [{ name: metric.label, value: stats.avg, fill: metric.fill }];

          return (
            <div key={metric.key} className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex flex-col">
              <div className="text-center mb-2">
                <h2 className="text-xl font-semibold">{metric.label}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Latest: {latest} {metric.unit} • Avg: {stats.avg.toFixed(2)} {metric.unit}
                </p>
              </div>
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
                                {stats.avg.toFixed(2)}
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
              <div className="flex flex-col items-center mt-4 gap-1 text-sm">
                <div className="flex items-center gap-2 font-medium text-green-600">
                  Stable Performance <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Based on selected transaction
                </div>
              </div>
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
                      <td>{stats.min.toFixed(2)} {metric.unit}</td>
                      <td>{stats.max.toFixed(2)} {metric.unit}</td>
                      <td>{stats.avg.toFixed(2)} {metric.unit}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}