"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import DarkModeToggle from "./DarkModeToggle";
import StateTable from "./StateTable";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Dynamic imports
const SystemMetrics = dynamic(() => import("./SystemMetrics"), { ssr: false });
const ChargingMetrics = dynamic(() => import("./CharginMetrics"), { ssr: false });
const AdditionalInsights = dynamic(() => import("./AdditionalInsights"), { ssr: false });

// Component to display power and energy graphs
const StatusDisplay = ({ l2Data, filteredData, showFullGraphs, setShowFullGraphs }) => {
  // Prepare data for graphs
  const graphData = showFullGraphs ? l2Data : filteredData.l2Data;
  
  // Calculate power (voltage * current) and ensure data availability
  const hasPowerData = graphData.some(item => item.voltage != null && item.current != null);
  const hasEnergyData = graphData.some(item => item.currentEnergy != null);

  // Warn if dataset is large
  const DATA_THRESHOLD = 10000;
  const isLargeDataset = graphData.length > DATA_THRESHOLD;

  // Prepare chart data with all points
  const powerChartData = {
    labels: graphData.map(item => item.timestamp || 'N/A'),
    datasets: [
      {
        label: 'Power (W)',
        data: graphData.map(item => 
          item.voltage != null && item.current != null ? item.voltage * item.current : 0
        ),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
    ],
  };

  const energyChartData = {
    labels: graphData.map(item => item.timestamp || 'N/A'),
    datasets: [
      {
        label: 'Consumed Energy (kWh)',
        data: graphData.map(item => item.currentEnergy || 0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Status Graphs</h3>
      <div className="flex gap-2">
        <Button
          variant={showFullGraphs ? "outline" : "default"}
          onClick={() => setShowFullGraphs(false)}
          disabled={!filteredData.l2Data.length}
        >
          Show Graphs for Transaction {filteredData.l2Data.length ? filteredData.l2Data[0]?.transactionId || 'Selected' : 'None'}
        </Button>
        <Button
          variant={showFullGraphs ? "default" : "outline"}
          onClick={() => setShowFullGraphs(true)}
          disabled={!l2Data.length}
        >
          Show Full Log Graphs
        </Button>
      </div>

      {isLargeDataset && (
        <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Large dataset detected ({graphData.length.toLocaleString()} points). Rendering may be slow.
        </div>
      )}

      {hasPowerData ? (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-md font-semibold mb-4">Power Variation Over Time</h4>
            <Line
              data={powerChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { 
                    display: true, 
                    text: `Power (W) - ${showFullGraphs ? 'All Log Data' : 'All Data for Transaction'}` 
                  },
                },
                scales: {
                  x: { title: { display: true, text: 'Timestamp' } },
                  y: { title: { display: true, text: 'Power (W)' }, beginAtZero: true },
                },
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          ❌ No power data (voltage or current) available for {showFullGraphs ? 'full log' : 'selected transaction'}.
        </div>
      )}

      {hasEnergyData ? (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-md font-semibold mb-4">Consumed Energy Variation Over Time</h4>
            <Line
              data={energyChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { 
                    display: true, 
                    text: `Consumed Energy (kWh) - ${showFullGraphs ? 'All Log Data' : 'All Data for Transaction'}` 
                  },
                },
                scales: {
                  x: { title: { display: true, text: 'Timestamp' } },
                  y: { title: { display: true, text: 'Consumed Energy (kWh)' }, beginAtZero: true },
                },
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          ❌ No energy data (currentEnergy) available for {showFullGraphs ? 'full log' : 'selected transaction'}.
        </div>
      )}
    </div>
  );
};

// Component to display categorized sessions
const SessionsDisplay = ({ sessions }) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Normal': return '✅';
      case 'Warning': return '⚠️';
      case 'Critical': return '❌';
      case 'Test/Calibration': return '🧪';
      case 'Idle/No activity': return '💤';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Charging Sessions</h3>
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold">
                    {getCategoryIcon(session.category)} Session {session.transactionId || 'No Transaction ID'}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {session.startTime} to {session.endTime || 'N/A'}
                  </span>
                </div>
                <div className="text-sm mt-2">
                  <p><strong>Category:</strong> {session.category}</p>
                  <p><strong>Battery Health Score:</strong> {session.batteryHealthScore}/100</p>
                  <p><strong>Charging Behavior:</strong> {session.chargingBehavior}</p>
                  <p><strong>Status:</strong> {session.chargingStatus}</p>
                  {session.errors.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Errors:</strong></p>
                      <ul className="list-disc pl-5 text-xs">
                        {session.errors.slice(0, 3).map((error, i) => (
                          <li key={i}>
                            {error.timestamp}: {error.errorCode ? `${error.errorCode} - ` : ''}{error.message}
                          </li>
                        ))}
                        {session.errors.length > 3 && (
                          <li>... and {session.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-4">
          No session data available.
        </div>
      )}
    </div>
  );
};

const BATCH_SIZE = 1000;
const DATA_LIMIT = 5000;
const PROMPT_SIZE_LIMIT = 500000;

export default function Dashboard() {
  const [data, setData] = useState({
    l2Data: [],
    metricsData: [],
    l2MainState: [],
    l2ChildState: [],
    l2MainContext: [],
    l2ChildContext: [],
    memoryUsage: [],
    errors: [],
  });
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState("");
  const [progress, setProgress] = useState({
    processed: 0,
    total: 0,
    percentage: 0,
  });
  const [transactionIds, setTransactionIds] = useState([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState("");
  const workerRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState("");
  const [showDataTable, setShowDataTable] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [showFullGraphs, setShowFullGraphs] = useState(false);

  // Collect all available parameters from all datasets
  const availableParameters = useMemo(() => {
    const params = {};
    const addParams = (dataset, source) => {
      dataset.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'timestamp' && key !== 'transactionId') {
            params[`${key} (${source})`] = { source, key };
          }
        });
      });
    };
    if (data.l2Data.length > 0) addParams(data.l2Data, 'l2Data');
    if (data.metricsData.length > 0) addParams(data.metricsData, 'metricsData');
    if (data.l2MainState.length > 0) addParams(data.l2MainState, 'l2MainState');
    if (data.l2ChildState.length > 0) addParams(data.l2ChildState, 'l2ChildState');
    if (data.l2MainContext.length > 0) addParams(data.l2MainContext, 'l2MainContext');
    if (data.l2ChildContext.length > 0) addParams(data.l2ChildContext, 'l2ChildContext');
    if (data.memoryUsage.length > 0) addParams(data.memoryUsage, 'memoryUsage');
    return params;
  }, [data]);

  const parameterUnits = {
    currentEnergy: 'kWh',
    voltage: 'V',
    current: 'A',
    cpuUsage: '%',
    memoryUsage: 'MB',
    cpuTemperature: '°C',
    diskUsage: '%',
  };

  const bufferedResults = useRef({
    l2Data: [],
    metricsData: [],
    l2MainState: [],
    l2ChildState: [],
    l2MainContext: [],
    l2ChildContext: [],
    memoryUsage: [],
    errors: [],
  });

  const flushBuffer = useCallback(() => {
    console.log("Flushing buffer:", { ...bufferedResults.current });
    setData((prev) => {
      const updated = { ...prev };
      let hasUpdates = false;
      Object.keys(bufferedResults.current).forEach((key) => {
        if (bufferedResults.current[key].length > 0) {
          updated[key] = [...prev[key], ...bufferedResults.current[key]].slice(0, DATA_LIMIT);
          bufferedResults.current[key] = [];
          hasUpdates = true;
          if (key === "l2MainState") {
            console.log("Flushed l2MainState:", updated.l2MainState);
          }
          if (key === "metricsData") {
            console.log("Updated metricsData length:", updated.metricsData.length);
          }
          if (key === "l2MainContext") {
            const allIds = new Set(
              [...updated.l2MainContext.map((item) => item.transactionId)].filter(Boolean)
            );
            console.log("All transaction IDs after flush:", Array.from(allIds));
          }
        }
      });
      return hasUpdates ? updated : prev;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
      if (abortControllerRef.current) abortControllerRef.current.abort();
      bufferedResults.current = {
        l2Data: [],
        metricsData: [],
        l2MainState: [],
        l2ChildState: [],
        l2MainContext: [],
        l2ChildContext: [],
        memoryUsage: [],
        errors: [],
      };
    };
  }, []);

  const parseFile = async (file) => {
    if (workerRef.current) workerRef.current.terminate();
    if (abortControllerRef.current) abortControllerRef.current.abort();

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setCurrentStage("Reading file...");
    setProgress({ processed: 0, total: file.size, percentage: 0 });
    setData({
      l2Data: [],
      metricsData: [],
      l2MainState: [],
      l2ChildState: [],
      l2MainContext: [],
      l2ChildContext: [],
      memoryUsage: [],
      errors: [],
    });
    setSessions([]);
    bufferedResults.current = {
      l2Data: [],
      metricsData: [],
      l2MainState: [],
      l2ChildState: [],
      l2MainContext: [],
      l2ChildContext: [],
      memoryUsage: [],
      errors: [],
    };
    setTransactionIds([]);
    setSelectedTransactionId("");
    setShowFullGraphs(false);
    setSelectedParameter("");

    try {
      console.log("Starting file parse for:", file.name);
      const workerCode = `
        const regexes = {
          l2Data: /^(.+?)\\s*info:\\s*L2\\s*Data:\\s*({.*?})\\s*currentEnergy:\\s*(-?\\d+(?:\\.\\d+)?)/i,
          metricsData: /^(.+?)\\s*info:\\s*MetricsData:\\s*({.*?cpuUsage.*?memoryUsage.*?cpuTemperature.*?diskUsage.*?})(?=\\s*}|$)/i,
          l2MainState: /(.+?)\\s*info:\\s*L2Main\\s*State\\s*[:\\s]*({.*?})(?:\\s*\\|\\s*L2child\\s+State:\\s*({.*?}))?/i,
          l2MainAndChildContext: /^(.+?)\\s*info:\\s*L2Main\\s*Context:\\s*({.*?transactionId.*?})\\s*\\|\\s*L2Child\\s*Context:\\s*({.*?})/i,
          l2MainContext: /^(.+?)\\s*info:\\s*L2Main\\s*Context:\\s*({.*?transactionId.*?})(?!\\s*\\|)/i,
          l2ChildContext: /^(.+?)\\s*info:\\s*L2Child\\s*Context:\\s*({.*?})(?!\\s*\\|)/i,
          memory: /^(.+?)\\s*info:\\s*Memory:\\s*({.*?})/i,
          error: /^(.+?)\\s*info:\\s*error:\\s*(\\w+)?\\s*(?:-\\s*)?(.*)/i,
          errorLog: /^(.+?)\\s*ERROR:\\s*Error:\\s*(\\w+)/i
        };

        let allTransactionIds = new Set();

        self.onmessage = function(e) {
          console.log("Worker received lines:", e.data.lines.length);
          const lines = e.data.lines;
          const startLineNumber = e.data.startLineNumber;
          const batchSize = ${BATCH_SIZE};
          const results = {
            l2Data: [], metricsData: [], l2MainState: [], l2ChildState: [],
            l2MainContext: [], l2ChildContext: [], memoryUsage: [], errors: [],
          };

          for(let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = startLineNumber + i;
            if (!line || !line.trim()) continue;

            for (const [key, regex] of Object.entries(regexes)) {
              const match = regex.exec(line);
              if (match) {
                try {
                  let jsonData = {};
                  if (key === "l2Data") {
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    results.l2Data.push({
                      timestamp: match[1],
                      currentEnergy: parseFloat(match[3]),
                      voltage: jsonData.voltage || null,
                      current: jsonData.current || null,
                      transactionId: context ? context.transactionId : null,
                      ...jsonData
                    });
                  } else if (key === "metricsData") {
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    results.metricsData.push({
                      timestamp: match[1],
                      transactionId: context ? context.transactionId : null,
                      ...jsonData
                    });
                  } else if (key === "l2MainAndChildContext") {
                    const timestamp = match[1];
                    const mainContextJson = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    const childContextJson = JSON.parse(match[3].trim().replace(/'/g, '"'));
                    const transactionId = typeof mainContextJson.transactionId === "object" && mainContextJson.transactionId !== null
                      ? mainContextJson.transactionId.id || mainContextJson.transactionId.toString()
                      : mainContextJson.transactionId;
                    if (transactionId) {
                      allTransactionIds.add(transactionId);
                      results.l2MainContext.push({
                        timestamp: timestamp,
                        transactionId: transactionId,
                        ...mainContextJson
                      });
                    }
                    results.l2ChildContext.push({
                      timestamp: timestamp,
                      transactionId: transactionId,
                      ...childContextJson
                    });
                    if (childContextJson.errorCode) {
                      results.errors.push({
                        timestamp: timestamp,
                        errorCode: childContextJson.errorCode,
                        message: childContextJson.errorMessage || 'L2Child Context error',
                        transactionId: transactionId
                      });
                    }
                  } else if (key === "l2MainContext") {
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    const transactionId = typeof jsonData.transactionId === "object" && jsonData.transactionId !== null
                      ? jsonData.transactionId.id || jsonData.transactionId.toString()
                      : jsonData.transactionId;
                    if (transactionId) {
                      allTransactionIds.add(transactionId);
                      results.l2MainContext.push({
                        timestamp: match[1],
                        transactionId: transactionId,
                        ...jsonData
                      });
                    }
                  } else if (key === "l2ChildContext") {
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    results.l2ChildContext.push({
                      timestamp: match[1],
                      transactionId: context ? context.transactionId : null,
                      ...jsonData
                    });
                    if (jsonData.errorCode) {
                      results.errors.push({
                        timestamp: match[1],
                        errorCode: jsonData.errorCode,
                        message: jsonData.errorMessage || 'L2Child Context error',
                        transactionId: context ? context.transactionId : null
                      });
                    }
                  } else if (key === "l2MainState") {
                    const timestamp = match[1];
                    const mainStateJson = match[2] ? JSON.parse(match[2].trim().replace(/'/g, '"')) : {};
                    const childStateJson = match[3] ? JSON.parse(match[3].trim().replace(/'/g, '"')) : {};
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    const combinedState = {
                      timestamp: timestamp,
                      transactionId: context ? context.transactionId : null,
                      ...mainStateJson
                    };
                    if (Object.keys(childStateJson).length === 1) {
                      const [childKey] = Object.keys(childStateJson);
                      combinedState[childKey] = childStateJson[childKey];
                    }
                    if (Object.keys(combinedState).length > 1) {
                      results.l2MainState.push(combinedState);
                    }
                    if (Object.keys(childStateJson).length > 0) {
                      results.l2ChildState.push({
                        timestamp: timestamp,
                        transactionId: context ? context.transactionId : null,
                        ...childStateJson
                      });
                    }
                    console.log("Matched l2MainState at line " + lineNumber + ":", { timestamp: match[1], rawLine: line, matchGroups: match, parsedData: combinedState });
                  } else if (key === "error") {
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    results.errors.push({
                      timestamp: match[1],
                      errorCode: match[2] || null,
                      message: match[3] || 'No message',
                      transactionId: context ? context.transactionId : null
                    });
                  } else if (key === "errorLog") {
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    results.errors.push({
                      timestamp: match[1],
                      errorCode: match[2],
                      message: 'Error from log',
                      transactionId: context ? context.transactionId : null
                    });
                  } else {
                    const outKey = key === "memory" ? "memoryUsage" : key;
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    results.outKey.push({
                      timestamp: match[1],
                      transactionId: context ? context.transactionId : null,
                      ...jsonData
                    });
                  }
                } catch (err) {
                  results.errors.push({
                    timestamp: match ? match[1] : "Line " + lineNumber,
                    errorCode: null,
                    message: err.message + ' - Raw: ' + line,
                    transactionId: null
                  });
                  console.log("Parsing error on line:", lineNumber, "Error:", err, "Raw line:", line);
                }
                break;
              }
            }
          }

          console.log("Parsed transaction IDs from batch:", Array.from(allTransactionIds));
          self.postMessage({ type: 'batch', results: results, processed: lines.length });

          if (e.data.lines.length < batchSize) {
            console.log("Final transaction IDs:", Array.from(allTransactionIds));
            self.postMessage({ type: 'final', transactionIds: Array.from(allTransactionIds) });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      workerRef.current = new Worker(URL.createObjectURL(blob));
      console.log("Worker initialized:", workerRef.current);

      const CHUNK_SIZE = 1024 * 512;
      let offset = 0;
      const fileSize = file.size;
      let fileText = "";

      while (offset < fileSize) {
        if (signal.aborted) {
          console.log("Parsing aborted at offset:", offset);
          setIsLoading(false);
          setCurrentStage("Parsing cancelled");
          return;
        }

        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const chunkText = await chunk.text();
        fileText += chunkText;
        console.log(`Read chunk at offset ${offset}, size: ${chunkText.length}`);

        offset += CHUNK_SIZE;
        setProgress({
          processed: offset,
          total: fileSize,
          percentage: Math.min(100, Math.floor((offset / fileSize) * 20)),
        });
        await new Promise((res) => setTimeout(res, 1));
      }

      setCurrentStage("Processing lines...");
      const allLines = fileText.split(/\r?\n/);
      console.log("Total lines to process:", allLines.length);
      const totalLines = allLines.length;
      setProgress({ processed: 0, total: totalLines, percentage: 20 });

      let currentIndex = 0;

      workerRef.current.onmessage = async (e) => {
        const { type, results, processed, transactionIds } = e.data;
        console.log(`Received message type: ${type}, processed: ${processed}, results:`, results);
        if (type === "batch") {
          console.log("Worker results:", results);
          Object.entries(results).forEach(([key, arr]) => {
            bufferedResults.current[key].push(...arr);
          });

          setProgress((prev) => {
            const newProcessed = prev.processed + processed;
            if (newProcessed % 1000 < BATCH_SIZE || newProcessed >= totalLines) {
              flushBuffer();
            }
            return {
              processed: newProcessed,
              total: totalLines,
              percentage: Math.min(100, 20 + Math.floor((newProcessed / totalLines) * 80)),
            };
          });

          if (currentIndex < totalLines) {
            const batchLines = allLines.slice(currentIndex, currentIndex + BATCH_SIZE);
            workerRef.current.postMessage({
              lines: batchLines,
              startLineNumber: currentIndex + 1,
            });
            currentIndex += BATCH_SIZE;
          }
        } else if (type === "final") {
          console.log("Received final transaction IDs:", transactionIds);
          setTransactionIds((prev) => [...new Set([...prev, ...transactionIds])]);
          flushBuffer();
          console.log(
            "Final data lengths - l2Data:",
            data.l2Data.length,
            "l2MainState:",
            data.l2MainState.length,
            "l2ChildState:",
            data.l2ChildState.length,
            "l2MainContext:",
            data.l2MainContext.length,
            "l2ChildContext:",
            data.l2ChildContext.length,
            "errors:",
            data.errors.length
          );

          // Group data by transactionId for session analysis
          const sessionsData = {};
          const addToSession = (item, dataset) => {
            const tid = item.transactionId || 'no-transaction';
            if (!sessionsData[tid]) {
              sessionsData[tid] = {
                l2Data: [],
                metricsData: [],
                l2MainState: [],
                l2ChildState: [],
                l2MainContext: [],
                l2ChildContext: [],
                memoryUsage: [],
                errors: [],
                startTime: item.timestamp,
                endTime: item.timestamp,
              };
            }
            sessionsData[tid][dataset].push(item);
            if (item.timestamp < sessionsData[tid].startTime) sessionsData[tid].startTime = item.timestamp;
            if (item.timestamp > sessionsData[tid].endTime) sessionsData[tid].endTime = item.timestamp;
          };

          Object.entries(data).forEach(([key, items]) => {
            items.forEach(item => addToSession(item, key));
          });

          // Analyze sessions with AI
          setCurrentStage("Analyzing sessions...");
          const sessionResults = [];
          for (const [tid, session] of Object.entries(sessionsData)) {
            const sessionSummary = {
              transactionId: tid === 'no-transaction' ? null : tid,
              l2Data: session.l2Data.slice(0, 50).map(item => ({
                timestamp: item.timestamp,
                currentEnergy: item.currentEnergy,
                voltage: item.voltage,
                current: item.current,
              })),
              metricsData: session.metricsData.slice(0, 50).map(item => ({
                timestamp: item.timestamp,
                cpuUsage: item.cpuUsage,
                memoryUsage: item.memoryUsage,
                cpuTemperature: item.cpuTemperature,
                diskUsage: item.diskUsage,
              })),
              l2MainState: session.l2MainState.slice(0, 50).map(item => ({
                timestamp: item.timestamp,
                ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId')),
              })),
              l2ChildState: session.l2ChildState.slice(0, 50).map(item => ({
                timestamp: item.timestamp,
                ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId')),
              })),
              errors: session.errors.slice(0, 50).map(item => ({
                timestamp: item.timestamp,
                errorCode: item.errorCode,
                message: item.message,
              })),
              summaryStats: {
                l2Data: {
                  totalRecords: session.l2Data.length,
                  voltage: session.l2Data.length ? {
                    average: session.l2Data.reduce((sum, item) => sum + (item.voltage || 0), 0) / session.l2Data.length,
                    min: Math.min(...session.l2Data.map(item => item.voltage || Infinity)),
                    max: Math.max(...session.l2Data.map(item => item.voltage || -Infinity)),
                  } : {},
                  current: session.l2Data.length ? {
                    average: session.l2Data.reduce((sum, item) => sum + (item.current || 0), 0) / session.l2Data.length,
                    min: Math.min(...session.l2Data.map(item => item.current || Infinity)),
                    max: Math.max(...session.l2Data.map(item => item.current || -Infinity)),
                  } : {},
                  currentEnergy: session.l2Data.length ? {
                    average: session.l2Data.reduce((sum, item) => sum + (item.currentEnergy || 0), 0) / session.l2Data.length,
                    min: Math.min(...session.l2Data.map(item => item.currentEnergy || Infinity)),
                    max: Math.max(...session.l2Data.map(item => item.currentEnergy || -Infinity)),
                  } : {},
                },
                metricsData: {
                  totalRecords: session.metricsData.length,
                  cpuTemperature: session.metricsData.length ? {
                    average: session.metricsData.reduce((sum, item) => sum + (item.cpuTemperature || 0), 0) / session.metricsData.length,
                    max: Math.max(...session.metricsData.map(item => item.cpuTemperature || -Infinity)),
                  } : {},
                },
                errors: {
                  total: session.errors.length,
                  errorCodes: [...new Set(session.errors.map(e => e.errorCode).filter(Boolean))],
                },
              },
            };

            const prompt = `
              Categorize the following EV charging session (Transaction ID: ${tid}) into one of these categories: Normal, Warning, Critical, Test/Calibration, or Idle/No activity. Also provide a battery health score (0–100), estimated charging behavior type (e.g., Fast Charging, Slow Charging, Interrupted), and charging success/failure status. Use these criteria:
              - Normal: No errors, stable voltage/current (deviations <10% from average), normal CPU temperature (<70°C).
              - Warning: Minor issues like voltage fluctuations (10–20% deviation), non-critical errors (e.g., E001).
              - Critical: Severe issues like overvoltage (>20% deviation), high CPU temperature (>80°C), critical errors (e.g., UnderVoltage, OverCurrent, E002).
              - Test/Calibration: States with keywords like Test, Calibration, Diagnostics.
              - Idle/No activity: No l2Data or only metricsData/memoryUsage with no state changes.
              - Battery Health Score: Based on error frequency, voltage stability, and energy delivered (higher is better).
              - Charging Behavior: Fast Charging (current >20A), Slow Charging (current ≤20A), Interrupted (errors during charging).
              - Charging Success/Failure: Success if Authorize: accepted and no critical errors; failure if critical errors or no charging data.
              Data:
              ${JSON.stringify(sessionSummary, null, 2)}
              Provide a JSON response with: category, batteryHealthScore, chargingBehavior, chargingStatus, and reasoning.
            `;

            const promptSize = prompt.length;
            console.log(`Session ${tid} prompt size: ${promptSize}`);
            if (promptSize > PROMPT_SIZE_LIMIT) {
              sessionResults.push({
                transactionId: tid,
                category: 'Unknown',
                batteryHealthScore: 0,
                chargingBehavior: 'Unknown',
                chargingStatus: 'Unknown',
                errors: session.errors,
                startTime: session.startTime,
                endTime: session.endTime,
                reasoning: `Prompt size (${promptSize}) exceeds limit (${PROMPT_SIZE_LIMIT}).`,
              });
              continue;
            }

            try {
              const response = await fetch('http://localhost:3001/api/ask-llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
              });
              const result = await response.json();
              if (response.ok && result.response) {
                try {
                  const parsed = JSON.parse(result.response);
                  sessionResults.push({
                    transactionId: tid === 'no-transaction' ? null : tid,
                    category: parsed.category || 'Unknown',
                    batteryHealthScore: parsed.batteryHealthScore || 0,
                    chargingBehavior: parsed.chargingBehavior || 'Unknown',
                    chargingStatus: parsed.chargingStatus || 'Unknown',
                    errors: session.errors,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    reasoning: parsed.reasoning || 'No reasoning provided',
                  });
                } catch (err) {
                  sessionResults.push({
                    transactionId: tid,
                    category: 'Unknown',
                    batteryHealthScore: 0,
                    chargingBehavior: 'Unknown',
                    chargingStatus: 'Unknown',
                    errors: session.errors,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    reasoning: `Failed to parse AI response: ${err.message}`,
                  });
                }
              } else {
                sessionResults.push({
                  transactionId: tid,
                  category: 'Unknown',
                  batteryHealthScore: 0,
                  chargingBehavior: 'Unknown',
                  chargingStatus: 'Unknown',
                  errors: session.errors,
                  startTime: session.startTime,
                  endTime: session.endTime,
                  reasoning: `AI error: ${result.error || 'Unknown error'}`,
                });
              }
            } catch (err) {
              sessionResults.push({
                transactionId: tid,
                category: 'Unknown',
                batteryHealthScore: 0,
                chargingBehavior: 'Unknown',
                chargingStatus: 'Unknown',
                errors: session.errors,
                startTime: session.startTime,
                endTime: session.endTime,
                reasoning: `AI request failed: ${err.message}`,
              });
            }
          }

          setSessions(sessionResults);
          console.log("Categorized sessions:", sessionResults);
          setIsLoading(false);
          setCurrentStage("Parsing and session analysis complete!");
          workerRef.current.terminate();
          workerRef.current = null;
        }
      };

      const firstBatch = allLines.slice(0, BATCH_SIZE);
      currentIndex = BATCH_SIZE;
      workerRef.current.postMessage({ lines: firstBatch, startLineNumber: 1 });
      console.log("Sent first batch, size:", firstBatch.length);
    } catch (err) {
      console.error("Error during parsing:", err);
      setIsLoading(false);
      setCurrentStage("Error during parsing");
      setData((prev) => ({ ...prev, errors: [...prev.errors, { timestamp: new Date().toISOString(), errorCode: null, message: err.message, transactionId: null }] }));
    }
  };

  const askAIAboutLog = async () => {
    if (!aiPrompt.trim() || !Object.keys(data).some(key => data[key].length > 0)) {
      setAiResponse('❌ No data available or prompt is empty.');
      return;
    }
    if (!selectedParameter || !availableParameters[selectedParameter]) {
      setAiResponse(`❌ Selected parameter "${selectedParameter}" is not available in the data.`);
      return;
    }

    try {
      setIsFetchingAI(true);
      setAiResponse('');

      const { source, key } = availableParameters[selectedParameter];

      // Filter data by transactionId if selected, otherwise limit non-transaction datasets
      const filterByTransactionId = (items) => {
        return selectedTransactionId
          ? items.filter((item) => item.transactionId === selectedTransactionId)
          : items.slice(0, DATA_LIMIT);
      };

      // Prepare filtered or limited data
      const logData = {
        l2Data: filterByTransactionId(data.l2Data).map(item => ({
          timestamp: item.timestamp || 'N/A',
          transactionId: item.transactionId || 'N/A',
          ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId'))
        })),
        metricsData: filterByTransactionId(data.metricsData).map(item => ({
          timestamp: item.timestamp || 'N/A',
          transactionId: item.transactionId || 'N/A',
          ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId'))
        })),
        l2MainState: filterByTransactionId(data.l2MainState).map(item => ({
          timestamp: item.timestamp || 'N/A',
          transactionId: item.transactionId || 'N/A',
          ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId'))
        })),
        l2ChildState: filterByTransactionId(data.l2ChildState).map(item => ({
          timestamp: item.timestamp || 'N/A',
          transactionId: item.transactionId || 'N/A',
          ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId'))
        })),
        l2MainContext: filterByTransactionId(data.l2MainContext).map(item => ({
          timestamp: item.timestamp || 'N/A',
          transactionId: item.transactionId || 'N/A',
          ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId'))
        })),
        l2ChildContext: filterByTransactionId(data.l2ChildContext).map(item => ({
          timestamp: item.timestamp || 'N/A',
          transactionId: item.transactionId || 'N/A',
          ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId'))
        })),
        memoryUsage: filterByTransactionId(data.memoryUsage).map(item => ({
          timestamp: item.timestamp || 'N/A',
          transactionId: item.transactionId || 'N/A',
          ...Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'timestamp' && k !== 'transactionId'))
        })),
        errors: filterByTransactionId(data.errors).map(item => ({
          timestamp: item.timestamp || 'N/A',
          errorCode: item.errorCode || 'N/A',
          message: item.message || 'N/A',
          transactionId: item.transactionId || 'N/A',
        })),
      };

      // Calculate summary statistics
      const summaryStats = {
        l2Data: {
          totalRecords: logData.l2Data.length,
          [key]: logData.l2Data.length && source === 'l2Data' ? {
            average: Number.isFinite(logData.l2Data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / logData.l2Data.length)
              ? (logData.l2Data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / logData.l2Data.length).toFixed(2)
              : 'N/A',
            min: logData.l2Data.length ? Math.min(...logData.l2Data.map(item => Number(item[key]) || Infinity)) : 'N/A',
            max: logData.l2Data.length ? Math.max(...logData.l2Data.map(item => Number(item[key]) || -Infinity)) : 'N/A',
          } : {},
        },
        metricsData: {
          totalRecords: logData.metricsData.length,
          [key]: logData.metricsData.length && source === 'metricsData' ? {
            average: Number.isFinite(logData.metricsData.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / logData.metricsData.length)
              ? (logData.metricsData.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / logData.metricsData.length).toFixed(2)
              : 'N/A',
            min: logData.metricsData.length ? Math.min(...logData.metricsData.map(item => Number(item[key]) || Infinity)) : 'N/A',
            max: logData.metricsData.length ? Math.max(...logData.metricsData.map(item => Number(item[key]) || -Infinity)) : 'N/A',
          } : {},
        },
        l2MainState: {
          totalRecords: logData.l2MainState.length,
          [key]: logData.l2MainState.length && source === 'l2MainState' ? {
            uniqueValues: [...new Set(logData.l2MainState.map(item => item[key]))].join(', '),
          } : {},
        },
        l2ChildState: {
          totalRecords: logData.l2ChildState.length,
          [key]: logData.l2ChildState.length && source === 'l2ChildState' ? {
            uniqueValues: [...new Set(logData.l2ChildState.map(item => item[key]))].join(', '),
          } : {},
        },
        l2MainContext: { totalRecords: logData.l2MainContext.length },
        l2ChildContext: { totalRecords: logData.l2ChildContext.length },
        errors: {
          totalRecords: logData.errors.length,
          errorCodes: [...new Set(logData.errors.map(e => e.errorCode).filter(Boolean))],
        },
      };

      const promptSize = JSON.stringify(logData).length;
      console.log('Prompt size:', promptSize);

      if (promptSize > PROMPT_SIZE_LIMIT) {
        setAiResponse(`❌ Data too large (${(promptSize / 1000).toFixed(1)} KB). Select a specific transaction ID to reduce data.`);
        return;
      }

      const unit = parameterUnits[key] || '';
      const summarizationPrompt = `
        Analyze the "${key}" parameter (from ${source}${unit ? `, in ${unit}` : ''}) in the EV charging log data:
        - Provide average, min, max, and time-based trends for ${key} if numeric, or list unique values and their frequency if non-numeric.
        - Highlight anomalies, patterns, or significant values.
        - Relate ${key} to errors or other parameters (e.g., Authorize state, CPU temperature) if relevant.
        - Note: Data may be filtered by transaction ID${selectedTransactionId ? ` (${selectedTransactionId})` : ''}.
        - Data includes:
          - l2Data: Charging data
          - metricsData: System metrics
          - l2MainState: Main state data
          - l2ChildState: Child state data
          - l2MainContext: Main context data
          - l2ChildContext: Child context data
          - memoryUsage: Memory usage data
          - errors: Error messages with error codes
        Summary Stats:
        ${JSON.stringify(summaryStats, null, 2)}
        Full Data:
        ${JSON.stringify(logData, null, 2)}
        User Query: ${aiPrompt}
      `;

      const response = await fetch('http://localhost:3001/api/ask-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: summarizationPrompt }),
      });

      const result = await response.json();
      if (response.ok && result.response) {
        setAiResponse(result.response);
      } else {
        setAiResponse(`❌ Error: ${result.error || 'AI server returned an error'} - Details: ${result.details || 'None'}`);
      }
    } catch (err) {
      console.error('Frontend fetch error:', err.message);
      setAiResponse(`❌ Error contacting AI: ${err.message}`);
    } finally {
      setIsFetchingAI(false);
    }
  };

  const viewData = () => {
    if (!Object.keys(data).some(key => data[key].length > 0)) {
      setAiResponse('❌ No data available to view.');
      return;
    }
    if (!selectedParameter || !availableParameters[selectedParameter]) {
      setAiResponse(`❌ Selected parameter "${selectedParameter}" is not available in the data.`);
      return;
    }
    setShowDataTable(!showDataTable);
    setChartData(null);
  };

  const plotData = () => {
    if (!Object.keys(data).some(key => data[key].length > 0)) {
      setAiResponse('❌ No data available to plot.');
      return;
    }
    if (!selectedParameter || !availableParameters[selectedParameter]) {
      setAiResponse(`❌ Selected parameter "${selectedParameter}" is not available in the data.`);
      return;
    }
    setShowDataTable(false);
    const { source, key } = availableParameters[selectedParameter];
    const dataset = selectedTransactionId
      ? data[source].filter(item => item.transactionId === selectedTransactionId)
      : data[source].slice(0, DATA_LIMIT);
    const labels = dataset.map(item => item.timestamp || 'N/A');
    const values = dataset.map(item => item[key] != null ? item[key] : 0);
    setChartData({
      labels,
      datasets: [
        {
          label: `${key} (${parameterUnits[key] || source})`,
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    });
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
      parseFile(file);
    }
  };

  const cancelParsing = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setCurrentStage("");
    setProgress({ processed: 0, total: 0, percentage: 0 });
  };

  const clearData = () => {
    setData({
      l2Data: [],
      metricsData: [],
      l2MainState: [],
      l2ChildState: [],
      l2MainContext: [],
      l2ChildContext: [],
      memoryUsage: [],
      errors: [],
    });
    setSessions([]);
    setProgress({ processed: 0, total: 0, percentage: 0 });
    setCurrentStage("");
    setTransactionIds([]);
    setSelectedTransactionId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowDataTable(false);
    setChartData(null);
    setShowFullGraphs(false);
    setSelectedParameter("");
  };

  const totalRecords = useMemo(() => {
    return Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
  }, [data]);

  const filteredData = useMemo(() => {
    console.log("Filtering data for transactionId:", selectedTransactionId);
    if (!selectedTransactionId)
      return { l2Data: [], metricsData: [], errors: [] };

    const filterByTransactionId = (items) => {
      return items.filter((item) => item.transactionId === selectedTransactionId);
    };

    return {
      l2Data: filterByTransactionId(data.l2Data),
      metricsData: filterByTransactionId(data.metricsData),
      errors: filterByTransactionId(data.errors),
    };
  }, [
    selectedTransactionId,
    data.l2Data,
    data.metricsData,
    data.errors,
  ]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">EV Charging Log Analyzer</h1>
        <DarkModeToggle />
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".txt,.log"
              onChange={onFileChange}
              disabled={isLoading}
              className="flex-1"
            />
            {!isLoading &&
              (data.l2Data.length > 0 || data.errors.length > 0) && (
                <Button variant="outline" onClick={clearData}>
                  Clear
                </Button>
              )}
            {isLoading && (
              <Button variant="destructive" onClick={cancelParsing}>
                Cancel
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {currentStage}{" "}
                  {progress.processed > 0 && progress.total > 0 && (
                    <>
                      {" "}
                      ({progress.processed.toLocaleString()} /{" "}
                      {progress.total.toLocaleString()}){" "}
                    </>
                  )}
                </span>
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {!isLoading && totalRecords > 0 && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Successfully parsed {totalRecords.toLocaleString()} total records
            </div>
          )}

          {transactionIds.length > 0 && (
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm text-gray-600">Transaction IDs:</span>
              {transactionIds.map((id) => (
                <span
                  key={id}
                  className={`text-sm px-2 py-1 rounded cursor-pointer ${
                    selectedTransactionId === id
                      ? "bg-blue-500 text-white dark:bg-blue-700"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedTransactionId(id)}
                >
                  {id}
                </span>
              ))}
            </div>
          )}

          {filteredData.errors.length > 0 && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
              <div className="font-medium">
                Errors for Transaction {selectedTransactionId} (
                {filteredData.errors.length}):
              </div>
              {filteredData.errors.slice(0, 5).map((error, i) => (
                <div key={i} className="text-xs mt-1">
                  {error.timestamp}: {error.errorCode ? `${error.errorCode} - ` : ''}{error.message}
                </div>
              ))}
              {filteredData.errors.length > 5 && (
                <div className="text-xs mt-1">
                  ... and {filteredData.errors.length - 5} more
                </div>
              )}
            </div>
          )}

          {!selectedTransactionId && totalRecords > DATA_LIMIT && (
            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ Large dataset detected ({totalRecords.toLocaleString()} records). Select a Transaction ID to reduce data sent to AI.
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="ai">AI Analysis</TabsTrigger>
          <TabsTrigger value="parsed">Parsed Data</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <SessionsDisplay sessions={sessions} />
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                💡 AI Agent: Analyze Log Parameters
              </h2>
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:text-white"
                disabled={!Object.keys(availableParameters).length}
              >
                <option value="">Select a parameter</option>
                {Object.keys(availableParameters).sort().map((param) => (
                  <option key={param} value={param}>
                    {param}
                  </option>
                ))}
              </select>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={`e.g., Summarize how ${selectedParameter || 'a parameter'} varies in the EV charging log.`}
                className="w-full h-28 p-3 text-sm border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:text-white"
                disabled={!Object.keys(availableParameters).length}
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={askAIAboutLog}
                  disabled={isFetchingAI || !selectedParameter || !availableParameters[selectedParameter]}
                >
                  {isFetchingAI ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Thinking...
                    </span>
                  ) : (
                    "Analyze"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={viewData}
                  disabled={!selectedParameter || !availableParameters[selectedParameter]}
                >
                  {showDataTable ? "Hide Data" : "View Data"}
                </Button>
                <Button
                  variant="outline"
                  onClick={plotData}
                  disabled={!selectedParameter || !availableParameters[selectedParameter]}
                >
                  Plot Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setAiPrompt(`Summarize how ${selectedParameter || 'the selected parameter'} varies in the EV charging log, including trends and anomalies.`)
                  }
                  disabled={!selectedParameter || !availableParameters[selectedParameter]}
                >
                  Use Default Summary Prompt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAiPrompt("")}
                  disabled={!aiPrompt}
                >
                  Clear Prompt
                </Button>
              </div>
              {isFetchingAI && (
                <div className="text-sm text-gray-600 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing AI request...
                </div>
              )}
              {aiResponse && (
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                  <strong>AI Response ({selectedParameter}):</strong>
                  <p>{aiResponse}</p>
                </div>
              )}
              {showDataTable && selectedParameter && availableParameters[selectedParameter] && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 p-2">Timestamp</th>
                        <th className="border border-gray-300 dark:border-gray-600 p-2">
                          {selectedParameter} ({parameterUnits[availableParameters[selectedParameter].key] || availableParameters[selectedParameter].source})
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data[availableParameters[selectedParameter].source].slice(0, 20).map((item, index) => (
                        <tr key={index} className="even:bg-gray-50 dark:even:bg-gray-800">
                          <td className="border border-gray-300 dark:border-gray-600 p-2">{item.timestamp || '-'}</td>
                          <td className="border border-gray-300 dark:border-gray-600 p-2">
                            {item[availableParameters[selectedParameter].key] != null 
                              ? item[availableParameters[selectedParameter].key] 
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {chartData && (
                <div className="mt-4">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: {
                          display: true,
                          text: `${selectedParameter} (${parameterUnits[availableParameters[selectedParameter].key] || availableParameters[selectedParameter].source}) Variation Over Time`,
                        },
                      },
                      scales: {
                        x: { title: { display: true, text: 'Timestamp' } },
                        y: {
                          title: {
                            display: true,
                            text: `${selectedParameter} (${parameterUnits[availableParameters[selectedParameter].key] || availableParameters[selectedParameter].source})`,
                          },
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parsed">
          <Tabs defaultValue="metrics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="metrics">System Metrics</TabsTrigger>
              <TabsTrigger value="charging">Charging</TabsTrigger>
              <TabsTrigger value="context">Status</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="states">States</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics">
              {selectedTransactionId ? (
                <SystemMetrics
                  l2Data={filteredData.l2Data}
                  l2MainContext={data.l2MainContext}
                />
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Please select a Transaction ID to view metrics.
                </div>
              )}
            </TabsContent>
            <TabsContent value="charging">
              {selectedTransactionId ? (
                <ChargingMetrics l2Data={filteredData.l2Data} />
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Please select a Transaction ID to view charging data.
                </div>
              )}
            </TabsContent>
            <TabsContent value="context">
              {selectedTransactionId ? (
                <StatusDisplay
                  l2Data={data.l2Data}
                  filteredData={filteredData}
                  showFullGraphs={showFullGraphs}
                  setShowFullGraphs={setShowFullGraphs}
                />
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Please select a Transaction ID to view status graphs.
                </div>
              )}
            </TabsContent>
            <TabsContent value="insights">
              {selectedTransactionId ? (
                <AdditionalInsights
                  l2Data={filteredData.l2Data}
                  metricsData={filteredData.metricsData}
                />
              ) : (
                <div className="text-center text-gray-500 p-4">
                  Please select a Transaction ID to view insights.
                </div>
              )}
            </TabsContent>
            <TabsContent value="states">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Charging States</h2>
                {data.l2MainState.length > 0 ? (
                  <StateTable stateData={data.l2MainState} />
                ) : (
                  <div className="text-center text-gray-500 p-4">
                    No state data available.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}