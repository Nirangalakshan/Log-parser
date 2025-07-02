import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SessionsDisplay = ({ sessions, l2Data }) => {
  const [visibleGraphs, setVisibleGraphs] = useState({});

  const toggleGraphs = (sessionId) => {
    setVisibleGraphs((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Normal":
        return "✅";
      case "Warning":
        return "⚠️";
      case "Critical":
        return "❌";
      case "Test/Calibration":
        return "🧪";
      case "Idle/No activity":
        return "💤";
      default:
        return "";
    }
  };

  const DATA_THRESHOLD = 10000;

  // Defensive check for sessions
  if (!sessions || !Array.isArray(sessions)) {
    return (
      <div className="text-center text-gray-500 p-4">
        Sessions data is not available or invalid.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Charging Sessions</h3>
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, index) => {
            const sessionId = session.transactionId || "no-transaction";
            // Defensive check for l2Data
            const sessionData =
              l2Data && Array.isArray(l2Data)
                ? l2Data.filter(
                    (item) => item.transactionId === session.transactionId
                  )
                : [];
            const hasPowerData = sessionData.some(
              (item) => item.voltage != null && item.current != null
            );
            const hasEnergyData = sessionData.some(
              (item) => item.currentEnergy != null
            );
            const isLargeDataset = sessionData.length > DATA_THRESHOLD;

            const powerChartData = {
              labels: sessionData.length
                ? sessionData.map((item) => item.timestamp || "N/A")
                : [],
              datasets: [
                {
                  label: "Power (W)",
                  data: sessionData.length
                    ? sessionData.map((item) =>
                        item.voltage != null && item.current != null
                          ? item.voltage * item.current
                          : 0
                      )
                    : [],
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: true,
                },
              ],
            };

            const energyChartData = {
              labels: sessionData.length
                ? sessionData.map((item) => item.timestamp || "N/A")
                : [],
              datasets: [
                {
                  label: "Consumed Energy (kWh)",
                  data: sessionData.length
                    ? sessionData.map((item) => item.currentEnergy || 0)
                    : [],
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: true,
                },
              ],
            };

            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-semibold">
                      {getCategoryIcon(session.category)} Session{" "}
                      {session.transactionId || "No Transaction ID"}
                    </h4>
                    <span className="text-sm text-gray-600">
                      {session.startTime} to {session.endTime || "N/A"}
                    </span>
                  </div>
                  <div className="text-sm mt-2">
                    <p>
                      <strong>Category:</strong> {session.category}
                    </p>
                    <p>
                      <strong>Battery Health Score:</strong>{" "}
                      {session.batteryHealthScore}/100
                    </p>
                    <p>
                      <strong>Charging Behavior:</strong>{" "}
                      {session.chargingBehavior}
                    </p>
                    <p>
                      <strong>Status:</strong> {session.chargingStatus}
                    </p>
                    {session.errors.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>Errors:</strong>
                        </p>
                        <ul className="list-disc pl-5 text-xs">
                          {session.errors.slice(0, 3).map((error, i) => (
                            <li key={i}>
                              {error.timestamp}:{" "}
                              {error.errorCode ? `${error.errorCode} - ` : ""}
                              {error.message}
                            </li>
                          ))}
                          {session.errors.length > 3 && (
                            <li>... and {session.errors.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button
                      variant={visibleGraphs[sessionId] ? "default" : "outline"}
                      onClick={() => toggleGraphs(sessionId)}
                      disabled={!hasPowerData && !hasEnergyData}
                    >
                      {visibleGraphs[sessionId] ? "Hide Graphs" : "Show Graphs"}
                    </Button>
                  </div>
                  {visibleGraphs[sessionId] && (
                    <div className="mt-4 space-y-4">
                      {isLargeDataset && (
                        <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                          ⚠️ Large dataset detected (
                          {sessionData.length.toLocaleString()} points).
                          Rendering may be slow.
                        </div>
                      )}
                      {hasPowerData ? (
                        <Card>
                          <CardContent className="pt-6">
                            <h4 className="text-md font-semibold mb-4">
                              Power Variation Over Time
                            </h4>
                            <Line
                              data={powerChartData}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: { position: "top" },
                                  title: {
                                    display: true,
                                    text: `Power (W) - Session ${
                                      session.transactionId || "No Transaction ID"
                                    }`,
                                  },
                                },
                                scales: {
                                  x: { title: { display: true, text: "Timestamp" } },
                                  y: {
                                    title: { display: true, text: "Power (W)" },
                                    beginAtZero: true,
                                  },
                                },
                              }}
                            />
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          ❌ No power data available for this session.
                        </div>
                      )}
                      {hasEnergyData ? (
                        <Card>
                          <CardContent className="pt-6">
                            <h4 className="text-md font-semibold mb-4">
                              Consumed Energy Variation Over Time
                            </h4>
                            <Line
                              data={energyChartData}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: { position: "top" },
                                  title: {
                                    display: true,
                                    text: `Consumed Energy (kWh) - Session ${
                                      session.transactionId || "No Transaction ID"
                                    }`,
                                  },
                                },
                                scales: {
                                  x: { title: { display: true, text: "Timestamp" } },
                                  y: {
                                    title: {
                                      display: true,
                                      text: "Consumed Energy (kWh)",
                                    },
                                    beginAtZero: true,
                                  },
                                },
                              }}
                            />
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          ❌ No energy data available for this session.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-4">
          No session data available.
        </div>
      )}
    </div>
  );
};

export default SessionsDisplay;