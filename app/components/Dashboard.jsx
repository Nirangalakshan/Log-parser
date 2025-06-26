
// "use client";

// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useCallback,
//   useMemo,
// } from "react";
// import dynamic from "next/dynamic";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import DarkModeToggle from "./DarkModeToggle";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// const SystemMetrics = dynamic(() => import("./SystemMetrics"), { ssr: false });
// const ChargingMetrics = dynamic(() => import("./CharginMetrics"), {
//   ssr: false,
// });
// const StatusContext = dynamic(() => import("./StatusContext"), { ssr: false });
// const AdditionalInsights = dynamic(() => import("./AdditionalInsights"), {
//   ssr: false,
// });

// // Define BATCH_SIZE at the component level
// const BATCH_SIZE = 200;

// export default function Dashboard() {
//   const [data, setData] = useState({
//     l2Data: [],
//     metricsData: [],
//     l2MainState: [],
//     l2ChildState: [],
//     l2MainContext: [],
//     l2ChildContext: [],
//     memoryUsage: [],
//     errors: [],
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentStage, setCurrentStage] = useState("");
//   const [progress, setProgress] = useState({
//     processed: 0,
//     total: 0,
//     percentage: 0,
//   });
//   const [transactionIds, setTransactionIds] = useState([]);
//   const [selectedTransactionId, setSelectedTransactionId] = useState("");
//   const workerRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const abortControllerRef = useRef(null);

//   const bufferedResults = useRef({
//     l2Data: [],
//     metricsData: [],
//     l2MainState: [],
//     l2ChildState: [],
//     l2MainContext: [],
//     l2ChildContext: [],
//     memoryUsage: [],
//     errors: [],
//   });

//   const flushBuffer = useCallback(() => {
//     console.log("Flushing buffer:", { ...bufferedResults.current });
//     setData((prev) => {
//       const updated = { ...prev };
//       let hasUpdates = false;
//       Object.keys(bufferedResults.current).forEach((key) => {
//         if (bufferedResults.current[key].length > 0) {
//           updated[key] = [...prev[key], ...bufferedResults.current[key]];
//           bufferedResults.current[key] = [];
//           hasUpdates = true;
//           if (key === "metricsData") {
//             console.log(
//               "Updated metricsData length:",
//               updated.metricsData.length
//             );
//           }
//           if (key === "l2MainContext") {
//             const allIds = new Set(
//               [
//                 ...updated.l2MainContext.map((item) => item.transactionId),
//               ].filter(Boolean)
//             );
//             console.log("All transaction IDs after flush:", Array.from(allIds));
//           }
//         }
//       });
//       return hasUpdates ? updated : prev;
//     });
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (workerRef.current) workerRef.current.terminate();
//       if (abortControllerRef.current) abortControllerRef.current.abort();
//       bufferedResults.current = {
//         l2Data: [],
//         metricsData: [],
//         l2MainState: [],
//         l2ChildState: [],
//         l2MainContext: [],
//         l2ChildContext: [],
//         memoryUsage: [],
//         errors: [],
//       };
//     };
//   }, []);

//   const parseFile = async (file) => {
//     if (workerRef.current) workerRef.current.terminate();
//     if (abortControllerRef.current) abortControllerRef.current.abort();

//     abortControllerRef.current = new AbortController();
//     const signal = abortControllerRef.current.signal;

//     setIsLoading(true);
//     setCurrentStage("Reading file...");
//     setProgress({ processed: 0, total: file.size, percentage: 0 });
//     setData({
//       l2Data: [],
//       metricsData: [],
//       l2MainState: [],
//       l2ChildState: [],
//       l2MainContext: [],
//       l2ChildContext: [],
//       memoryUsage: [],
//       errors: [],
//     });
//     bufferedResults.current = {
//       l2Data: [],
//       metricsData: [],
//       l2MainState: [],
//       l2ChildState: [],
//       l2MainContext: [],
//       l2ChildContext: [],
//       memoryUsage: [],
//       errors: [],
//     };
//     setTransactionIds([]);
//     setSelectedTransactionId("");

//     try {
//       console.log("Starting file parse for:", file.name);
//       // Inside parseFile function, update workerCode
//       const workerCode = `
//   const regexes = {
//     l2Data: /^(.+?) info: L2\\s*Data:\\s*({.*?})\\s*currentEnergy:\\s*(-?\\d+(?:\\.\\d+)?)/i,
//     metricsData: /^(.+?) info: MetricsData:\\s*({.*?cpuUsage.*?memoryUsage.*?cpuTemperature.*?diskUsage.*?})(?=\\s*}|$)/i,
//     l2MainState: /^(.+?) info: L2Main State: ({.*?})/i,
//     l2ChildState: /^(.+?) info: L2Child State: ({.*?})/i,
//     l2MainContext: /^(.+?) info: L2Main Context: ({.*?transactionId.*?})/i,
//     l2ChildContext: /^(.+?) info: L2Child Context: ({.*?})/i,
//     memory: /^(.+?) info: Memory: ({.*?})/i,
//     error: /^(.+?) info: error: (.*)/i
//   };

//   let allTransactionIds = new Set();

//   self.onmessage = function(e) {
//     console.log("Worker received lines:", e.data.lines.length);
//     const lines = e.data.lines;
//     const startLineNumber = e.data.startLineNumber;
//     const batchSize = ${BATCH_SIZE};
//     const results = {
//       l2Data: [], metricsData: [], l2MainState: [],
//       l2ChildState: [], l2MainContext: [], l2ChildContext: [],
//       memoryUsage: [], errors: [],
//     };

//     for(let i = 0; i < lines.length; i++) {
//       const line = lines[i];
//       const lineNumber = startLineNumber + i;
//       if (!line || !line.trim()) continue;

//       for (const [key, regex] of Object.entries(regexes)) {
//         const match = regex.exec(line);
//         if (match) {
//           try {
//             let jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
//             if (key === "l2Data") {
//               results.l2Data.push({
//                 timestamp: match[1],
//                 currentEnergy: parseFloat(match[3]),
//                 ...jsonData
//               });
//             } else if (key === "metricsData") {
//               results.metricsData.push({
//                 timestamp: match[1],
//                 ...jsonData
//               });
//             } else if (key === "l2MainContext") {
//               // Handle nested transactionId if present
//               const transactionId = typeof jsonData.transactionId === "object" && jsonData.transactionId !== null
//                 ? jsonData.transactionId.id || jsonData.transactionId.toString()
//                 : jsonData.transactionId;
//               if (transactionId) {
//                 allTransactionIds.add(transactionId);
//                 results.l2MainContext.push({
//                   timestamp: match[1],
//                   transactionId: transactionId,
//                   ...jsonData
//                 });
//               }
//             } else if (key === "error") {
//               const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
//               results.errors.push({
//                 timestamp: match[1],
//                 message: match[2],
//                 transactionId: context ? context.transactionId : null
//               });
//             } else {
//               const outKey = key === "memory" ? "memoryUsage" : key;
//               results[outKey].push({
//                 timestamp: match[1],
//                 ...jsonData
//               });
//             }
//             console.log("Parsed " + key + " at line " + lineNumber + ":", { timestamp: match[1], data: jsonData });
//           } catch (err) {
//             results.errors.push({
//               timestamp: match ? match[1] : "Line " + lineNumber,
//               message: err.message + ' - Raw: ' + line,
//               transactionId: null
//             });
//             console.log("Parsing error on line:", line, "Error:", err);
//           }
//           break;
//         }
//       }
//     }

//     console.log("Parsed transaction IDs from batch:", Array.from(allTransactionIds));
//     self.postMessage({ type: 'batch', results: results, processed: lines.length });

//     if (e.data.lines.length < batchSize) {
//       console.log("Final transaction IDs:", Array.from(allTransactionIds));
//       self.postMessage({ type: 'final', transactionIds: Array.from(allTransactionIds) });
//     }
//   };
// `;

//       const blob = new Blob([workerCode], { type: "application/javascript" });
//       workerRef.current = new Worker(URL.createObjectURL(blob));
//       console.log("Worker initialized:", workerRef.current);

//       const CHUNK_SIZE = 1024 * 512;
//       let offset = 0;
//       const fileSize = file.size;
//       let fileText = "";

//       while (offset < fileSize) {
//         if (signal.aborted) {
//           console.log("Parsing aborted at offset:", offset);
//           setIsLoading(false);
//           setCurrentStage("Parsing cancelled");
//           return;
//         }

//         const chunk = file.slice(offset, offset + CHUNK_SIZE);
//         const chunkText = await chunk.text();
//         fileText += chunkText;
//         console.log(
//           `Read chunk at offset ${offset}, size: ${chunkText.length}`
//         );

//         offset += CHUNK_SIZE;
//         setProgress({
//           processed: offset,
//           total: fileSize,
//           percentage: Math.min(100, Math.floor((offset / fileSize) * 20)),
//         });
//         await new Promise((res) => setTimeout(res, 1));
//       }

//       setCurrentStage("Processing lines...");
//       const allLines = fileText.split(/\r?\n/);
//       console.log("Total lines to process:", allLines.length);
//       const totalLines = allLines.length;
//       setProgress({ processed: 0, total: totalLines, percentage: 20 });

//       let currentIndex = 0;

//       workerRef.current.onmessage = (e) => {
//         const { type, results, processed, transactionIds } = e.data;
//         console.log(
//           `Received message type: ${type}, processed: ${processed}, results:`,
//           results
//         );
//         if (type === "batch") {
//           console.log("Worker results:", results);
//           Object.entries(results).forEach(([key, arr]) => {
//             bufferedResults.current[key].push(...arr);
//           });

//           setProgress((prev) => {
//             const newProcessed = prev.processed + processed;
//             if (
//               newProcessed % 1000 < BATCH_SIZE ||
//               newProcessed >= totalLines
//             ) {
//               flushBuffer();
//             }
//             return {
//               processed: newProcessed,
//               total: totalLines,
//               percentage: Math.min(
//                 100,
//                 20 + Math.floor((newProcessed / totalLines) * 80)
//               ),
//             };
//           });

//           if (currentIndex < totalLines) {
//             const batchLines = allLines.slice(
//               currentIndex,
//               currentIndex + BATCH_SIZE
//             );
//             workerRef.current.postMessage({
//               lines: batchLines,
//               startLineNumber: currentIndex + 1,
//             });
//             currentIndex += BATCH_SIZE;
//           }
//         } else if (type === "final") {
//           console.log("Received final transaction IDs:", transactionIds);
//           setTransactionIds((prev) => [
//             ...new Set([...prev, ...transactionIds]),
//           ]);
//           flushBuffer();
//           console.log(
//             "Final data lengths - l2Data:",
//             data.l2Data.length,
//             "l2MainContext:",
//             data.l2MainContext.length
//           );
//           setIsLoading(false);
//           setCurrentStage("Parsing complete!");
//           workerRef.current.terminate();
//           workerRef.current = null;
//         }
//       };

//       const firstBatch = allLines.slice(0, BATCH_SIZE);
//       currentIndex = BATCH_SIZE;
//       workerRef.current.postMessage({ lines: firstBatch, startLineNumber: 1 });
//       console.log("Sent first batch, size:", firstBatch.length);
//     } catch (err) {
//       console.error("Error during parsing:", err);
//       setIsLoading(false);
//       setCurrentStage("Error during parsing");
//       setData((prev) => ({ ...prev, errors: [...prev.errors, err.message] }));
//     }
//   };

//   const onFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       console.log("Selected file:", file.name);
//       parseFile(file);
//     }
//   };

//   const cancelParsing = () => {
//     if (workerRef.current) {
//       workerRef.current.terminate();
//       workerRef.current = null;
//     }
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     setIsLoading(false);
//     setCurrentStage("");
//     setProgress({ processed: 0, total: 0, percentage: 0 });
//   };

//   const clearData = () => {
//     setData({
//       l2Data: [],
//       metricsData: [],
//       l2MainState: [],
//       l2ChildState: [],
//       l2MainContext: [],
//       l2ChildContext: [],
//       memoryUsage: [],
//       errors: [],
//     });
//     setProgress({ processed: 0, total: 0, percentage: 0 });
//     setCurrentStage("");
//     setTransactionIds([]);
//     setSelectedTransactionId("");
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const totalRecords = useMemo(() => {
//     return Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
//   }, [data]);

//   const filteredData = useMemo(() => {
//     console.log("Filtering data for transactionId:", selectedTransactionId);
//     if (!selectedTransactionId)
//       return { l2Data: [], metricsData: [], errors: [] };

//     // Create a map of transactionIds by timestamp for efficient lookup
//     const contextMap = new Map();
//     data.l2MainContext.forEach((item) => {
//       if (item.timestamp && item.transactionId) {
//         contextMap.set(item.timestamp, item.transactionId);
//       }
//     });

//     const filterByTransactionId = (items) => {
//       return items.filter((item) => {
//         const contextId = contextMap.get(item.timestamp);
//         return contextId === selectedTransactionId;
//       });
//     };

//     return {
//       l2Data: filterByTransactionId(data.l2Data),
//       metricsData: filterByTransactionId(data.metricsData),
//       errors: data.errors.filter(
//         (error) => error.transactionId === selectedTransactionId
//       ),
//     };
//   }, [
//     selectedTransactionId,
//     data.l2Data,
//     data.metricsData,
//     data.l2MainContext,
//     data.errors,
//   ]);

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-8">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">EV Charging Log Analyzer</h1>
//         <DarkModeToggle />
//       </div>

//       <Card>
//         <CardContent className="space-y-4">
//           <div className="flex gap-2">
//             <Input
//               ref={fileInputRef}
//               type="file"
//               accept=".txt,.log"
//               onChange={onFileChange}
//               disabled={isLoading}
//               className="flex-1"
//             />
//             {!isLoading &&
//               (data.l2Data.length > 0 || data.errors.length > 0) && (
//                 <Button variant="outline" onClick={clearData}>
//                   Clear
//                 </Button>
//               )}
//             {isLoading && (
//               <Button variant="destructive" onClick={cancelParsing}>
//                 Cancel
//               </Button>
//             )}
//           </div>

//           {isLoading && (
//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-gray-600">
//                   {currentStage}{" "}
//                   {progress.processed > 0 && progress.total > 0 && (
//                     <>
//                       {" "}
//                       ({progress.processed.toLocaleString()} /{" "}
//                       {progress.total.toLocaleString()}){" "}
//                     </>
//                   )}
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-3">
//                 <div
//                   className="bg-blue-600 h-3 rounded-full transition-all duration-200 ease-out"
//                   style={{ width: `${progress.percentage}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {!isLoading && data.l2Data.length > 0 && (
//             <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
//               ✅ Successfully parsed {totalRecords.toLocaleString()} total
//               records
//             </div>
//           )}

//           {transactionIds.length > 0 && (
//             <div className="flex gap-2 items-center">
//               <span className="text-sm text-gray-600">
//                 Select Transaction ID:
//               </span>
//               <Select
//                 onValueChange={setSelectedTransactionId}
//                 value={selectedTransactionId}
//               >
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue placeholder="Select a transaction ID" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {transactionIds.map((id) => (
//                     <SelectItem key={id} value={id}>
//                       {id}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           {filteredData.errors.length > 0 && (
//             <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
//               <div className="font-medium">
//                 Errors for Transaction {selectedTransactionId} (
//                 {filteredData.errors.length}):
//               </div>
//               {filteredData.errors.slice(0, 5).map((error, i) => (
//                 <div key={i} className="text-xs mt-1">
//                   {error.timestamp}: {error.message}
//                 </div>
//               ))}
//               {filteredData.errors.length > 5 && (
//                 <div className="text-xs mt-1">
//                   ... and {filteredData.errors.length - 5} more
//                 </div>
//               )}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Tabs defaultValue="metrics" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="metrics">System Metrics</TabsTrigger>
//           <TabsTrigger value="charging">Charging</TabsTrigger>
//           <TabsTrigger value="context">Status</TabsTrigger>
//           <TabsTrigger value="insights">Insights</TabsTrigger>
//         </TabsList>

//         <TabsContent value="metrics">
//           {selectedTransactionId ? (
//             <SystemMetrics
//               l2Data={filteredData.l2Data}
//               l2MainContext={data.l2MainContext}
//             />
//           ) : (
//             <div className="text-center text-gray-500 p-4">
//               Please select a Transaction ID to view metrics.
//             </div>
//           )}
//         </TabsContent>
//         <TabsContent value="charging">
//           {selectedTransactionId ? (
//             <ChargingMetrics l2Data={filteredData.l2Data} />
//           ) : (
//             <div className="text-center text-gray-500 p-4">
//               Please select a Transaction ID to view charging data.
//             </div>
//           )}
//         </TabsContent>
//         <TabsContent value="context">
//           {selectedTransactionId ? (
//             <StatusContext
//               l2MainState={data.l2MainState.filter((item) => {
//                 const context = data.l2MainContext.find(
//                   (c) => c.timestamp === item.timestamp
//                 );
//                 return (
//                   context && context.transactionId === selectedTransactionId
//                 );
//               })}
//               l2MainContext={data.l2MainContext.filter(
//                 (c) => c.transactionId === selectedTransactionId
//               )}
//             />
//           ) : (
//             <div className="text-center text-gray-500 p-4">
//               Please select a Transaction ID to view status.
//             </div>
//           )}
//         </TabsContent>
//         <TabsContent value="insights">
//           {selectedTransactionId ? (
//             <AdditionalInsights
//               l2Data={filteredData.l2Data}
//               metricsData={filteredData.metricsData}
//             />
//           ) : (
//             <div className="text-center text-gray-500 p-4">
//               Please select a Transaction ID to view insights.
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }









"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DarkModeToggle from "./DarkModeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SystemMetrics = dynamic(() => import("./SystemMetrics"), { ssr: false });
const ChargingMetrics = dynamic(() => import("./CharginMetrics"), { ssr: false });
const StatusContext = dynamic(() => import("./StatusContext"), { ssr: false });
const AdditionalInsights = dynamic(() => import("./AdditionalInsights"), { ssr: false });
const StateTable = dynamic(() => import("./StateTable"), { ssr: false });

// Define BATCH_SIZE at the component level
const BATCH_SIZE = 200;

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
          updated[key] = [...prev[key], ...bufferedResults.current[key]];
          bufferedResults.current[key] = [];
          hasUpdates = true;
          if (key === "l2Data") {
            console.log("Flushed l2Data length:", updated.l2Data.length, "Sample:", updated.l2Data.slice(0, 2));
          }
          if (key === "metricsData") {
            console.log("Updated metricsData length:", updated.metricsData.length);
          }
          if (key === "l2MainContext") {
            const allIds = new Set([...updated.l2MainContext.map((item) => item.transactionId)].filter(Boolean));
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
        l2Data: [], metricsData: [], l2MainState: [],
        l2ChildState: [], l2MainContext: [], l2ChildContext: [],
        memoryUsage: [], errors: [],
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

    try {
      console.log("Starting file parse for:", file.name);
      const workerCode = `
        const regexes = {
          l2Data: /^(.+?) INFO: L2\\s*Data:\\s*({.*?})\\s*currentEnergy:\\s*(-?\\d+(?:\\.\\d+)?)(?:\\s*\\|\\s*L2Child State: ({.*?})\\s*\\||$)/i,
          metricsData: /^(.+?) info: MetricsData:\\s*({.*?cpuUsage.*?memoryUsage.*?cpuTemperature.*?diskUsage.*?})(?=\\s*}|$)/i,
          l2MainState: /^(.+?) INFO: L2Main State\\s*({.*?})(?:\\s*\\|\\s*L2Child State: ({.*?})\\s*\\||$)/i,
          l2ChildState: /^(.+?) INFO: L2Main State\\s*({.*?})\\s*\\|\\s*L2Child State: ({.*?})\\s*\\|/i,
          l2MainContext: /^(.+?) info: L2Main Context: ({.*?transactionId.*?})/i,
          l2ChildContext: /^(.+?) info: L2Child Context: ({.*?})/i,
          memory: /^(.+?) info: Memory: ({.*?})/i,
          error: /^(.+?) info: error: (.*)/i
        };

        let allTransactionIds = new Set();

        self.onmessage = function(e) {
          console.log("Worker received lines:", e.data.lines.length);
          const lines = e.data.lines;
          const startLineNumber = e.data.startLineNumber;
          const batchSize = ${BATCH_SIZE};
          const results = {
            l2Data: [], metricsData: [], l2MainState: [],
            l2ChildState: [], l2MainContext: [], l2ChildContext: [],
            memoryUsage: [], errors: [],
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
                    const childStateJson = match[4] ? JSON.parse(match[4].trim().replace(/'/g, '"')) : {};
                    const state = childStateJson.C1 || "N/A";
                    console.log("Parsed l2Data at line", lineNumber, ": raw line", line, "timestamp", match[1], "state", state, "type", typeof state);
                    results.l2Data.push({
                      timestamp: match[1],
                      currentEnergy: parseFloat(match[3]),
                      state: state,
                      ...jsonData
                    });
                  } else if (key === "metricsData") {
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    results.metricsData.push({
                      timestamp: match[1],
                      ...jsonData
                    });
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
                  } else if (key === "l2MainState") {
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    results.l2MainState.push({
                      timestamp: match[1],
                      ...jsonData
                    });
                    if (match[3]) { // If L2Child State is present in the same line
                      const childJson = JSON.parse(match[3].trim().replace(/'/g, '"'));
                      const state = childJson.C1 || "N/A";
                      console.log("Parsed l2ChildState at line", lineNumber, ": raw line", line, "timestamp", match[1], "state", state, "type", typeof state);
                      results.l2ChildState.push({
                        timestamp: match[1],
                        state: state,
                        ...childJson
                      });
                    }
                  } else if (key === "l2ChildState") {
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"')); // Main state (not used)
                    const childJson = JSON.parse(match[3].trim().replace(/'/g, '"'));
                    const state = childJson.C1 || "N/A";
                    console.log("Parsed l2ChildState at line", lineNumber, ": raw line", line, "timestamp", match[1], "state", state, "type", typeof state);
                    results.l2ChildState.push({
                      timestamp: match[1],
                      state: state,
                      ...childJson
                    });
                  } else if (key === "error") {
                    const context = results.l2MainContext.find((c) => c.timestamp === match[1]);
                    results.errors.push({
                      timestamp: match[1],
                      message: match[2],
                      transactionId: context ? context.transactionId : null
                    });
                  } else {
                    const outKey = key === "memory" ? "memoryUsage" : key;
                    jsonData = JSON.parse(match[2].trim().replace(/'/g, '"'));
                    results[outKey].push({
                      timestamp: match[1],
                      ...jsonData
                    });
                  }
                  console.log("Parsed " + key + " at line " + lineNumber + ":", { timestamp: match[1], data: jsonData });
                } catch (err) {
                  results.errors.push({
                    timestamp: match ? match[1] : "Line " + lineNumber,
                    message: err.message + ' - Raw: ' + line,
                    transactionId: null
                  });
                  console.log("Parsing error on line:", line, "Error:", err);
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

      workerRef.current.onmessage = (e) => {
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
          console.log("Final data lengths - l2Data:", data.l2Data.length, "l2ChildState:", data.l2ChildState.length);
          setIsLoading(false);
          setCurrentStage("Parsing complete!");
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
      setData((prev) => ({ ...prev, errors: [...prev.errors, err.message] }));
    }
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
    setProgress({ processed: 0, total: 0, percentage: 0 });
    setCurrentStage("");
    setTransactionIds([]);
    setSelectedTransactionId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const totalRecords = useMemo(() => {
    return Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
  }, [data]);

  const filteredData = useMemo(() => {
    console.log("Filtering data for transactionId:", selectedTransactionId);
    if (!selectedTransactionId) return { l2Data: [], metricsData: [], errors: [] };
    
    const contextMap = new Map();
    data.l2MainContext.forEach(item => {
      if (item.timestamp && item.transactionId) {
        contextMap.set(item.timestamp, item.transactionId);
      }
    });

    const filterByTransactionId = (items) => {
      return items.filter(item => {
        const contextId = contextMap.get(item.timestamp);
        return contextId === selectedTransactionId;
      });
    };

    return {
      l2Data: filterByTransactionId(data.l2Data),
      metricsData: filterByTransactionId(data.metricsData),
      errors: data.errors.filter(error => error.transactionId === selectedTransactionId),
    };
  }, [selectedTransactionId, data.l2Data, data.metricsData, data.l2MainContext, data.errors]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">EV Charging Log Analyzer</h1>
        <DarkModeToggle />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".txt,.log"
              onChange={onFileChange}
              disabled={isLoading}
              className="flex-1"
            />
            {!isLoading && (data.l2Data.length > 0 || data.errors.length > 0) && (
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
                    <> ({progress.processed.toLocaleString()} / {progress.total.toLocaleString()}) </>
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {!isLoading && data.l2Data.length > 0 && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Successfully parsed {totalRecords.toLocaleString()} total records
            </div>
          )}

          {transactionIds.length > 0 && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">Select Transaction ID:</span>
              <Select onValueChange={setSelectedTransactionId} value={selectedTransactionId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a transaction ID" />
                </SelectTrigger>
                <SelectContent>
                  {transactionIds.map((id) => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filteredData.errors.length > 0 && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
              <div className="font-medium">Errors for Transaction {selectedTransactionId} ({filteredData.errors.length}):</div>
              {filteredData.errors.slice(0, 5).map((error, i) => (
                <div key={i} className="text-xs mt-1">{error.timestamp}: {error.message}</div>
              ))}
              {filteredData.errors.length > 5 && (
                <div className="text-xs mt-1">... and {filteredData.errors.length - 5} more</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="charging">Charging</TabsTrigger>
          <TabsTrigger value="context">Status</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          {selectedTransactionId ? <SystemMetrics l2Data={filteredData.l2Data} l2MainContext={data.l2MainContext} /> : <div className="text-center text-gray-500 p-4">Please select a Transaction ID to view metrics.</div>}
        </TabsContent>
        <TabsContent value="charging">
          {selectedTransactionId ? <ChargingMetrics l2Data={filteredData.l2Data} /> : <div className="text-center text-gray-500 p-4">Please select a Transaction ID to view charging data.</div>}
        </TabsContent>
        <TabsContent value="context">
          {selectedTransactionId ? (
            <StatusContext
              l2MainState={data.l2MainState.filter(item => {
                const context = data.l2MainContext.find(c => c.timestamp === item.timestamp);
                return context && context.transactionId === selectedTransactionId;
              })}
              l2MainContext={data.l2MainContext.filter(c => c.transactionId === selectedTransactionId)}
            />
          ) : <div className="text-center text-gray-500 p-4">Please select a Transaction ID to view status.</div>}
        </TabsContent>
        <TabsContent value="insights">
          {selectedTransactionId ? <AdditionalInsights l2Data={filteredData.l2Data} metricsData={filteredData.metricsData} /> : <div className="text-center text-gray-500 p-4">Please select a Transaction ID to view insights.</div>}
        </TabsContent>
        <TabsContent value="states">
          {data.l2ChildState.length > 0 ? <StateTable l2ChildState={data.l2ChildState} /> : <div className="text-center text-gray-500 p-4">No state data available. Please load a file.</div>}
        </TabsContent>
      </Tabs>
    </div>
  );
}