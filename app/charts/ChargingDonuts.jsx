"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const COLORS = {
  voltage: "#2dd4bf",
  current: "#10b981",
  power: "#ef4444",
  energy: "#fb7185",
};

const ChargingDonuts = ({ data }) => {
  const latest = data[data.length - 1] || {
    voltage: 0,
    current: 0,
    power: 0,
    energy: 0,
  };

  const metrics = [
    { name: "Voltage (V)", value: latest.voltage, max: 500, key: "voltage" },
    { name: "Current (A)", value: latest.current, max: 100, key: "current" },
    { name: "Power (kW)", value: latest.power, max: 50, key: "power" },
    { name: "Energy (kWh)", value: latest.energy, max: 100, key: "energy" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const percentage = Math.min((metric.value / metric.max) * 100, 100);
        const chartData = [
          { name: metric.name, value: percentage },
          { name: "Remaining", value: 100 - percentage },
        ];

        return (
          <Card key={metric.name} className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-sm text-muted-foreground">{metric.name}</CardTitle>
            </CardHeader>
            <CardContent className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3}
                  >
                    <Cell fill={COLORS[metric.key]} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-sm mt-2 font-medium">
                {metric.value.toFixed(2)} / {metric.max}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ChargingDonuts;
