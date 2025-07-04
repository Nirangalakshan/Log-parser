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

// const SystemMetrics = dynamic(() => import("./SystemMetrics"), { ssr: false });
// const ChargingMetrics = dynamic(() => import("./CharginMetrics"), {
//   ssr: false,
// });
// const StatusContext = dynamic(() => import("./StatusContext"), { ssr: false });
// const AdditionalInsights = dynamic(() => import("./AdditionalInsights"), {
//   ssr: false,
// });
// import MetricsSummaryPDF from "./Summarypdf";
// import MetricsDashboard from "./Summarypdf";

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
//   const workerRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const abortControllerRef = useRef(null);

//   // Buffer for batching worker updates before flushing to UI
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

//   // Flush buffered results to UI state
//   const flushBuffer = useCallback(() => {
//     setData((prev) => {
//       const updated = { ...prev };
//       Object.keys(bufferedResults.current).forEach((key) => {
//         if (bufferedResults.current[key].length) {
//           updated[key] = [...updated[key], ...bufferedResults.current[key]];
//           bufferedResults.current[key] = [];
//         }
//       });
//       return updated;
//     });
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (workerRef.current) workerRef.current.terminate();
//       if (abortControllerRef.current) abortControllerRef.current.abort();
//     };
//   }, []);

//   const parseFile = async (file) => {
//     // Cleanup previous parse
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

//     try {
//       // Create the Web Worker from inline code
//       const workerCode = `
//         const regexes = {
//           l2Data: /^(.+?) info: L2\\s*Data:\\s*({.*?})\\s*currentEnergy:\\s*(-?\\d+(?:\\.\\d+)?)/,
//           metricsData: /^(.+?) info: MetricsData: ({.*?})/,
//           l2MainState: /^(.+?) info: L2Main State: ({.*?})/,
//           l2ChildState: /^(.+?) info: L2Child State: ({.*?})/,
//           l2MainContext: /^(.+?) info: L2Main Context: ({.*?})/,
//           l2ChildContext: /^(.+?) info: L2Child Context: ({.*?})/,
//           memory: /^(.+?) info: Memory: ({.*?})/,
//           error: /^(.+?) info: error: (.*)/
//         };

//         self.onmessage = function(e) {
//           const lines = e.data.lines;
//           const startLineNumber = e.data.startLineNumber;

//           const results = {
//             l2Data: [], metricsData: [], l2MainState: [],
//             l2ChildState: [], l2MainContext: [], l2ChildContext: [],
//             memoryUsage: [], errors: [],
//           };

//           for(let i = 0; i < lines.length; i++) {
//             const line = lines[i];
//             const lineNumber = startLineNumber + i;
//             if (!line || !line.trim()) continue;

//             for (const [key, regex] of Object.entries(regexes)) {
//               const match = regex.exec(line);
//               if (match) {
//                 try {
//                   const jsonData = JSON.parse(match[2]);
//                   if (key === "l2Data") {
//                     results.l2Data.push({
//                       timestamp: match[1],
//                       currentEnergy: parseFloat(match[3]),
//                       ...jsonData
//                     });
//                   } else {
//                     const outKey = key === "memory" ? "memoryUsage" : key;
//                     results[outKey].push({
//                       timestamp: match[1],
//                       ...jsonData
//                     });
//                   }
//                 } catch (err) {
//                   results.errors.push('Line ' + lineNumber + ': ' + err.message);
//                 }
//                 break;
//               }
//             }
//           }

//           self.postMessage({ type: 'batch', results, processed: lines.length });
//         };
//       `;

//       const blob = new Blob([workerCode], { type: "application/javascript" });
//       workerRef.current = new Worker(URL.createObjectURL(blob));

//       // Read file as text in chunks to avoid blocking UI
//       const CHUNK_SIZE = 1024 * 512; // 512KB
//       let offset = 0;
//       const fileSize = file.size;
//       let fileText = "";

//       while (offset < fileSize) {
//         if (signal.aborted) {
//           setIsLoading(false);
//           setCurrentStage("Parsing cancelled");
//           return;
//         }

//         const chunk = file.slice(offset, offset + CHUNK_SIZE);
//         fileText += await chunk.text();

//         offset += CHUNK_SIZE;
//         setProgress({
//           processed: offset,
//           total: fileSize,
//           percentage: Math.floor((offset / fileSize) * 20),
//         });
//         // Allow UI to breathe
//         await new Promise((res) => setTimeout(res, 1));
//       }

//       // Split into lines and send batches to worker
//       setCurrentStage("Processing lines...");
//       const allLines = fileText.split(/\r?\n/);
//       const totalLines = allLines.length;
//       setProgress({ processed: 0, total: totalLines, percentage: 20 });

//       let currentIndex = 0;
//       const BATCH_SIZE = 200;

//       workerRef.current.onmessage = (e) => {
//         const { type, results, processed } = e.data;
//         if (type === "batch") {
//           // Buffer results
//           Object.entries(results).forEach(([key, arr]) => {
//             bufferedResults.current[key].push(...arr);
//           });

//           // Update progress and flush buffer every 1000 lines
//           setProgress((prev) => {
//             const newProcessed = prev.processed + processed;
//             if (newProcessed % 1000 < BATCH_SIZE) {
//               flushBuffer();
//             }
//             return {
//               processed: newProcessed,
//               total: totalLines,
//               percentage: 20 + Math.floor((newProcessed / totalLines) * 80),
//             };
//           });

//           // Automatically send next batch
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
//           } else {
//             // No more batches, flush remaining buffer and end
//             flushBuffer();
//             setIsLoading(false);
//             setCurrentStage("Parsing complete!");
//             workerRef.current.terminate();
//             workerRef.current = null;
//           }
//         }
//       };

//       // Start sending first batch
//       const firstBatch = allLines.slice(0, BATCH_SIZE);
//       currentIndex = BATCH_SIZE;
//       workerRef.current.postMessage({ lines: firstBatch, startLineNumber: 1 });
//     } catch (err) {
//       setIsLoading(false);
//       setCurrentStage("Error during parsing");
//       setData((prev) => ({ ...prev, errors: [...prev.errors, err.message] }));
//     }
//   };

//   const onFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
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
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Efficient total count without flat()
//   const totalRecords = useMemo(() => {
//     return Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
//   }, [data]);

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
//                       ({progress.processed.toLocaleString()} /{" "}
//                       {progress.total.toLocaleString()})
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

//           {data.errors.length > 0 && (
//             <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
//               <div className="font-medium">
//                 Parsing Errors ({data.errors.length}):
//               </div>
//               {data.errors.slice(0, 5).map((error, i) => (
//                 <div key={i} className="text-xs mt-1">
//                   {error}
//                 </div>
//               ))}
//               {data.errors.length > 5 && (
//                 <div className="text-xs mt-1">
//                   ... and {data.errors.length - 5} more
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
//           <SystemMetrics metricsData={data.metricsData} />
//         </TabsContent>
//         <TabsContent value="charging">
//           <ChargingMetrics l2Data={data.l2Data} />
//         </TabsContent>
//         <TabsContent value="context">
//           <StatusContext
//             l2MainState={data.l2MainState}
//             l2MainContext={data.l2MainContext}
//           />
//         </TabsContent>
//         <TabsContent value="insights">
//           <AdditionalInsights l2MainContext={data.l2MainContext} />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }




//for previous log file
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

// const SystemMetrics = dynamic(() => import("./SystemMetrics"), { ssr: false });
// const ChargingMetrics = dynamic(() => import("./CharginMetrics"), {
//   ssr: false,
// });
// const StatusContext = dynamic(() => import("./StatusContext"), { ssr: false });
// const AdditionalInsights = dynamic(() => import("./AdditionalInsights"), {
//   ssr: false,
// });
// import MetricsSummaryPDF from "./Summarypdf";
// import MetricsDashboard from "./Summarypdf";

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
//   const workerRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const abortControllerRef = useRef(null);

//   // Buffer for batching worker updates before flushing to UI
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

//   // Flush buffered results to UI state
//   const flushBuffer = useCallback(() => {
//     setData((prev) => {
//       const updated = { ...prev };
//       Object.keys(bufferedResults.current).forEach((key) => {
//         if (bufferedResults.current[key].length) {
//           updated[key] = [...updated[key], ...bufferedResults.current[key]];
//           bufferedResults.current[key] = [];
//         }
//       });
//       return updated;
//     });
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (workerRef.current) workerRef.current.terminate();
//       if (abortControllerRef.current) abortControllerRef.current.abort();
//     };
//   }, []);

//   const parseFile = async (file) => {
//     // Cleanup previous parse
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

//     try {
//       // Create the Web Worker from inline code
//       const workerCode = `
//         const regexes = {
//           l2Data: /^(.+?) info: L2\\s*Data:\\s*({.*?})\\s*currentEnergy:\\s*(-?\\d+(?:\\.\\d+)?)/,
//           metricsData: /^(.+?) info: MetricsData: ({.*?})/,
//           l2MainState: /^(.+?) info: L2Main State: ({.*?})/,
//           l2ChildState: /^(.+?) info: L2Child State: ({.*?})/,
//           l2MainContext: /^(.+?) info: L2Main Context: ({.*?})/,
//           l2ChildContext: /^(.+?) info: L2Child Context: ({.*?})/,
//           memory: /^(.+?) info: Memory: ({.*?})/,
//           error: /^(.+?) info: error: (.*)/
//         };

//         self.onmessage = function(e) {
//           const lines = e.data.lines;
//           const startLineNumber = e.data.startLineNumber;

//           const results = {
//             l2Data: [], metricsData: [], l2MainState: [],
//             l2ChildState: [], l2MainContext: [], l2ChildContext: [],
//             memoryUsage: [], errors: [],
//           };

//           for(let i = 0; i < lines.length; i++) {
//             const line = lines[i];
//             const lineNumber = startLineNumber + i;
//             if (!line || !line.trim()) continue;

//             for (const [key, regex] of Object.entries(regexes)) {
//               const match = regex.exec(line);
//               if (match) {
//                 try {
//                   const jsonData = JSON.parse(match[2]);
//                   if (key === "l2Data") {
//                     results.l2Data.push({
//                       timestamp: match[1],
//                       currentEnergy: parseFloat(match[3]),
//                       ...jsonData
//                     });
//                   } else if (key === "metricsData") {
//                     results.metricsData.push({
//                       timestamp: match[1],
//                       ...jsonData,
//                       flags: {
//                         overVoltage: jsonData.overVoltage === true,
//                         overCurrent: jsonData.overCurrent === true,
//                         overTemp: jsonData.overTemp === true,
//                         underVoltage: jsonData.underVoltage === true
//                       }
//                     });
//                   } else {
//                     const outKey = key === "memory" ? "memoryUsage" : key;
//                     results[outKey].push({
//                       timestamp: match[1],
//                       ...jsonData
//                     });
//                   }
//                 } catch (err) {
//                   results.errors.push('Line ' + lineNumber + ': ' + err.message);
//                 }
//                 break;
//               }
//             }
//           }

//           self.postMessage({ type: 'batch', results, processed: lines.length });
//         };
//       `;

//       const blob = new Blob([workerCode], { type: "application/javascript" });
//       workerRef.current = new Worker(URL.createObjectURL(blob));

//       // Read file as text in chunks to avoid blocking UI
//       const CHUNK_SIZE = 1024 * 512; // 512KB
//       let offset = 0;
//       const fileSize = file.size;
//       let fileText = "";

//       while (offset < fileSize) {
//         if (signal.aborted) {
//           setIsLoading(false);
//           setCurrentStage("Parsing cancelled");
//           return;
//         }

//         const chunk = file.slice(offset, offset + CHUNK_SIZE);
//         fileText += await chunk.text();

//         offset += CHUNK_SIZE;
//         setProgress({
//           processed: offset,
//           total: fileSize,
//           percentage: Math.floor((offset / fileSize) * 20),
//         });
//         // Allow UI to breathe
//         await new Promise((res) => setTimeout(res, 1));
//       }

//       // Split into lines and send batches to worker
//       setCurrentStage("Processing lines...");
//       const allLines = fileText.split(/\r?\n/);
//       const totalLines = allLines.length;
//       setProgress({ processed: 0, total: totalLines, percentage: 20 });

//       let currentIndex = 0;
//       const BATCH_SIZE = 200;

//       workerRef.current.onmessage = (e) => {
//         const { type, results, processed } = e.data;
//         if (type === "batch") {
//           // Buffer results
//           Object.entries(results).forEach(([key, arr]) => {
//             bufferedResults.current[key].push(...arr);
//           });

//           // Update progress and flush buffer every 1000 lines
//           setProgress((prev) => {
//             const newProcessed = prev.processed + processed;
//             if (newProcessed % 1000 < BATCH_SIZE) {
//               flushBuffer();
//             }
//             return {
//               processed: newProcessed,
//               total: totalLines,
//               percentage: 20 + Math.floor((newProcessed / totalLines) * 80),
//             };
//           });

//           // Automatically send next batch
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
//           } else {
//             // No more batches, flush remaining buffer and end
//             flushBuffer();
//             setIsLoading(false);
//             setCurrentStage("Parsing complete!");
//             workerRef.current.terminate();
//             workerRef.current = null;
//           }
//         }
//       };

//       // Start sending first batch
//       const firstBatch = allLines.slice(0, BATCH_SIZE);
//       currentIndex = BATCH_SIZE;
//       workerRef.current.postMessage({ lines: firstBatch, startLineNumber: 1 });
//     } catch (err) {
//       setIsLoading(false);
//       setCurrentStage("Error during parsing");
//       setData((prev) => ({ ...prev, errors: [...prev.errors, err.message] }));
//     }
//   };

//   const onFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
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
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Efficient total count without flat()
//   const totalRecords = useMemo(() => {
//     return Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
//   }, [data]);

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
//                       ({progress.processed.toLocaleString()} /{" "}
//                       {progress.total.toLocaleString()})
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

//           {data.errors.length > 0 && (
//             <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
//               <div className="font-medium">
//                 Parsing Errors ({data.errors.length}):
//               </div>
//               {data.errors.slice(0, 5).map((error, i) => (
//                 <div key={i} className="text-xs mt-1">
//                   {error}
//                 </div>
//               ))}
//               {data.errors.length > 5 && (
//                 <div className="text-xs mt-1">
//                   ... and {data.errors.length - 5} more
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
//           <SystemMetrics metricsData={data.metricsData} />
//         </TabsContent>
//         <TabsContent value="charging">
//           <ChargingMetrics l2Data={data.l2Data} />
//         </TabsContent>
//         <TabsContent value="context">
//           <StatusContext
//             l2MainState={data.l2MainState}
//             l2MainContext={data.l2MainContext}
//           />
//         </TabsContent>
//         <TabsContent value="insights">
//           <AdditionalInsights l2MainContext={data.l2MainContext} />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }






//for newone
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

// const SystemMetrics = dynamic(() => import("./SystemMetrics"), { ssr: false });
// const ChargingMetrics = dynamic(() => import("./CharginMetrics"), {
//   ssr: false,
// });
// const StatusContext = dynamic(() => import("./StatusContext"), { ssr: false });
// const AdditionalInsights = dynamic(() => import("./AdditionalInsights"), {
//   ssr: false,
// });

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
//   const workerRef = useRef(null);
//   const fileInputRef = useRef(null);
//   const abortControllerRef = useRef(null);

//   // Buffer for batching worker updates before flushing to UI
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

//   // Flush buffered results to UI state
//   const flushBuffer = useCallback(() => {
//     console.log("Flushing buffer:", { ...bufferedResults.current }); // Debug log
//     setData((prev) => {
//       const updated = { ...prev };
//       let hasUpdates = false;
//       Object.keys(bufferedResults.current).forEach((key) => {
//         if (bufferedResults.current[key].length > 0) {
//           updated[key] = [...prev[key], ...bufferedResults.current[key]];
//           bufferedResults.current[key] = [];
//           hasUpdates = true;
//           if (key === "metricsData") {
//             console.log("Updated metricsData:", updated.metricsData); // Debug specific data
//           }
//         }
//       });
//       return hasUpdates ? updated : prev; // Only update if there are changes
//     });
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (workerRef.current) workerRef.current.terminate();
//       if (abortControllerRef.current) abortControllerRef.current.abort();
//     };
//   }, []);

//   const parseFile = async (file) => {
//     // Cleanup previous parse
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

//     try {
//       // Create the Web Worker from inline code
//       const workerCode = `
//         const regexes = {
//           l2Data: /^(.+?) info: L2\\s*Data:\\s*({.*?})\\s*currentEnergy:\\s*(-?\\d+(?:\\.\\d+)?)/i,
//           metricsData: /^(.+?) info: MetricsData:\\s*({.*?cpuUsage.*?memoryUsage.*?cpuTemperature.*?diskUsage.*?})(?=\\s*}|$)/i,
//           l2MainState: /^(.+?) info: L2Main State: ({.*?})/i,
//           l2ChildState: /^(.+?) info: L2Child State: ({.*?})/i,
//           l2MainContext: /^(.+?) info: L2Main Context: ({.*?})/i,
//           l2ChildContext: /^(.+?) info: L2Child Context: ({.*?})/i,
//           memory: /^(.+?) info: Memory: ({.*?})/i,
//           error: /^(.+?) info: error: (.*)/i
//         };

//         self.onmessage = function(e) {
//           const lines = e.data.lines;
//           const startLineNumber = e.data.startLineNumber;

//           const results = {
//             l2Data: [], metricsData: [], l2MainState: [],
//             l2ChildState: [], l2MainContext: [], l2ChildContext: [],
//             memoryUsage: [], errors: [],
//           };

//           for(let i = 0; i < lines.length; i++) {
//             const line = lines[i];
//             const lineNumber = startLineNumber + i;
//             if (!line || !line.trim()) continue;

//             for (const [key, regex] of Object.entries(regexes)) {
//               const match = regex.exec(line);
//               if (match) {
//                 try {
//                   let jsonData = JSON.parse(match[2].trim());
//                   if (key === "l2Data") {
//                     results.l2Data.push({
//                       timestamp: match[1],
//                       currentEnergy: parseFloat(match[3]),
//                       ...jsonData
//                     });
//                   } else if (key === "metricsData") {
//                     results.metricsData.push({
//                       timestamp: match[1],
//                       ...jsonData
//                     });
//                   } else {
//                     const outKey = key === "memory" ? "memoryUsage" : key;
//                     results[outKey].push({
//                       timestamp: match[1],
//                       ...jsonData
//                     });
//                   }
//                 } catch (err) {
//                   results.errors.push('Line ' + lineNumber + ': ' + err.message + ' - Raw: ' + line);
//                 }
//                 break;
//               }
//             }
//           }

//           self.postMessage({ type: 'batch', results, processed: lines.length });
//         };
//       `;

//       const blob = new Blob([workerCode], { type: "application/javascript" });
//       workerRef.current = new Worker(URL.createObjectURL(blob));

//       // Read file as text in chunks to avoid blocking UI
//       const CHUNK_SIZE = 1024 * 512; // 512KB
//       let offset = 0;
//       const fileSize = file.size;
//       let fileText = "";

//       while (offset < fileSize) {
//         if (signal.aborted) {
//           setIsLoading(false);
//           setCurrentStage("Parsing cancelled");
//           return;
//         }

//         const chunk = file.slice(offset, offset + CHUNK_SIZE);
//         fileText += await chunk.text();

//         offset += CHUNK_SIZE;
//         setProgress({
//           processed: offset,
//           total: fileSize,
//           percentage: Math.floor((offset / fileSize) * 20),
//         });
//         await new Promise((res) => setTimeout(res, 1));
//       }

//       // Split into lines and send batches to worker
//       setCurrentStage("Processing lines...");
//       const allLines = fileText.split(/\r?\n/);
//       const totalLines = allLines.length;
//       setProgress({ processed: 0, total: totalLines, percentage: 20 });

//       let currentIndex = 0;
//       const BATCH_SIZE = 200;

//       workerRef.current.onmessage = (e) => {
//         const { type, results, processed } = e.data;
//         if (type === "batch") {
//           console.log("Worker results:", results); // Debug log
//           // Buffer results
//           Object.entries(results).forEach(([key, arr]) => {
//             bufferedResults.current[key].push(...arr);
//           });

//           // Update progress and flush buffer
//           setProgress((prev) => {
//             const newProcessed = prev.processed + processed;
//             if (newProcessed % 1000 < BATCH_SIZE || newProcessed >= totalLines) {
//               flushBuffer();
//             }
//             return {
//               processed: newProcessed,
//               total: totalLines,
//               percentage: 20 + Math.floor((newProcessed / totalLines) * 80),
//             };
//           });

//           // Automatically send next batch
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
//           } else {
//             flushBuffer(); // Ensure final flush
//             setIsLoading(false);
//             setCurrentStage("Parsing complete!");
//             workerRef.current.terminate();
//             workerRef.current = null;
//           }
//         }
//       };

//       // Start sending first batch
//       const firstBatch = allLines.slice(0, BATCH_SIZE);
//       currentIndex = BATCH_SIZE;
//       workerRef.current.postMessage({ lines: firstBatch, startLineNumber: 1 });
//     } catch (err) {
//       setIsLoading(false);
//       setCurrentStage("Error during parsing");
//       setData((prev) => ({ ...prev, errors: [...prev.errors, err.message] }));
//     }
//   };

//   const onFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       console.log("Selected file:", file.name); // Debug file selection
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
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Efficient total count without flat()
//   const totalRecords = useMemo(() => {
//     return Object.values(data).reduce((acc, arr) => acc + arr.length, 0);
//   }, [data]);

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
//                       ({progress.processed.toLocaleString()} /{" "}
//                       {progress.total.toLocaleString()})
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

//           {data.errors.length > 0 && (
//             <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
//               <div className="font-medium">
//                 Parsing Errors ({data.errors.length}):
//               </div>
//               {data.errors.slice(0, 5).map((error, i) => (
//                 <div key={i} className="text-xs mt-1">
//                   {error}
//                 </div>
//               ))}
//               {data.errors.length > 5 && (
//                 <div className="text-xs mt-1">
//                   ... and {data.errors.length - 5} more
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
//           <SystemMetrics metricsData={data.metricsData} />
//         </TabsContent>
//         <TabsContent value="charging">
//           <ChargingMetrics l2Data={data.l2Data} />
//         </TabsContent>
//         <TabsContent value="context">
//           <StatusContext
//             l2MainState={data.l2MainState}
//             l2MainContext={data.l2MainContext}
//           />
//         </TabsContent>
//         <TabsContent value="insights">
//           <AdditionalInsights l2MainContext={data.l2MainContext} l2Data={data.l2Data} />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }




//for version2
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
const ChargingMetrics = dynamic(() => import("./CharginMetrics"), {
  ssr: false,
});
const StatusContext = dynamic(() => import("./StatusContext"), { ssr: false });
const AdditionalInsights = dynamic(() => import("./AdditionalInsights"), {
  ssr: false,
});

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
          if (key === "metricsData") {
            console.log("Updated metricsData:", updated.metricsData);
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
      const workerCode = `
        const regexes = {
          l2Data: /^(.+?) info: L2\\s*Data:\\s*({.*?})\\s*currentEnergy:\\s*(-?\\d+(?:\\.\\d+)?)/i,
          metricsData: /^(.+?) info: MetricsData:\\s*({.*?cpuUsage.*?memoryUsage.*?cpuTemperature.*?diskUsage.*?})(?=\\s*}|$)/i,
          l2MainState: /^(.+?) info: L2Main State: ({.*?})/i,
          l2ChildState: /^(.+?) info: L2Child State: ({.*?})/i,
          l2MainContext: /^(.+?) info: L2Main Context: ({.*?transactionId.*?})/i,
          l2ChildContext: /^(.+?) info: L2Child Context: ({.*?})/i,
          memory: /^(.+?) info: Memory: ({.*?})/i,
          error: /^(.+?) info: error: (.*)/i
        };

        self.onmessage = function(e) {
          const lines = e.data.lines;
          const startLineNumber = e.data.startLineNumber;
          const results = {
            l2Data: [], metricsData: [], l2MainState: [],
            l2ChildState: [], l2MainContext: [], l2ChildContext: [],
            memoryUsage: [], errors: [],
          };
          const transactionIds = new Set();

          for(let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = startLineNumber + i;
            if (!line || !line.trim()) continue;

            for (const [key, regex] of Object.entries(regexes)) {
              const match = regex.exec(line);
              if (match) {
                try {
                  let jsonData = JSON.parse(match[2].trim());
                  if (key === "l2Data") {
                    results.l2Data.push({
                      timestamp: match[1],
                      currentEnergy: parseFloat(match[3]),
                      ...jsonData
                    });
                  } else if (key === "metricsData") {
                    results.metricsData.push({
                      timestamp: match[1],
                      ...jsonData
                    });
                  } else if (key === "l2MainContext" && jsonData.transactionId) {
                    transactionIds.add(jsonData.transactionId);
                    results.l2MainContext.push({
                      timestamp: match[1],
                      ...jsonData
                    });
                  } else {
                    const outKey = key === "memory" ? "memoryUsage" : key;
                    results[outKey].push({
                      timestamp: match[1],
                      ...jsonData
                    });
                  }
                } catch (err) {
                  results.errors.push('Line ' + lineNumber + ': ' + err.message + ' - Raw: ' + line);
                }
                break;
              }
            }
          }

          self.postMessage({ type: 'batch', results, processed: lines.length, transactionIds: Array.from(transactionIds) });
        };
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      workerRef.current = new Worker(URL.createObjectURL(blob));

      const CHUNK_SIZE = 1024 * 512;
      let offset = 0;
      const fileSize = file.size;
      let fileText = "";

      while (offset < fileSize) {
        if (signal.aborted) {
          setIsLoading(false);
          setCurrentStage("Parsing cancelled");
          return;
        }

        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        fileText += await chunk.text();

        offset += CHUNK_SIZE;
        setProgress({
          processed: offset,
          total: fileSize,
          percentage: Math.floor((offset / fileSize) * 20),
        });
        await new Promise((res) => setTimeout(res, 1));
      }

      setCurrentStage("Processing lines...");
      const allLines = fileText.split(/\r?\n/);
      const totalLines = allLines.length;
      setProgress({ processed: 0, total: totalLines, percentage: 20 });

      let currentIndex = 0;
      const BATCH_SIZE = 200;

      workerRef.current.onmessage = (e) => {
        const { type, results, processed, transactionIds } = e.data;
        if (type === "batch") {
          console.log("Worker results:", results);
          Object.entries(results).forEach(([key, arr]) => {
            bufferedResults.current[key].push(...arr);
          });

          setProgress((prev) => {
            const newProcessed = prev.processed + processed;
            if (newProcessed % 1000 < BATCH_SIZE || newProcessed >= totalLines) {
              flushBuffer();
              if (transactionIds && transactionIds.length > 0) {
                setTransactionIds((prev) => [...new Set([...prev, ...transactionIds])]);
              }
            }
            return {
              processed: newProcessed,
              total: totalLines,
              percentage: 20 + Math.floor((newProcessed / totalLines) * 80),
            };
          });

          if (currentIndex < totalLines) {
            const batchLines = allLines.slice(currentIndex, currentIndex + BATCH_SIZE);
            workerRef.current.postMessage({
              lines: batchLines,
              startLineNumber: currentIndex + 1,
            });
            currentIndex += BATCH_SIZE;
          } else {
            flushBuffer();
            setIsLoading(false);
            setCurrentStage("Parsing complete!");
            workerRef.current.terminate();
            workerRef.current = null;
          }
        }
      };

      const firstBatch = allLines.slice(0, BATCH_SIZE);
      currentIndex = BATCH_SIZE;
      workerRef.current.postMessage({ lines: firstBatch, startLineNumber: 1 });
    } catch (err) {
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
    if (!selectedTransactionId) return { l2Data: [], metricsData: [], errors: [] };
    return {
      l2Data: data.l2Data.filter((item) => {
        const context = data.l2MainContext.find((c) => c.timestamp === item.timestamp);
        return context && context.transactionId === selectedTransactionId;
      }),
      metricsData: data.metricsData.filter((item) => {
        const context = data.l2MainContext.find((c) => c.timestamp === item.timestamp);
        return context && context.transactionId === selectedTransactionId;
      }),
      errors: data.errors.filter((error) => {
        const context = data.l2MainContext.find((c) => error.includes(c.timestamp));
        return context && context.transactionId === selectedTransactionId;
      }),
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

          {data.errors.length > 0 && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded max-h-32 overflow-y-auto">
              <div className="font-medium">Parsing Errors ({data.errors.length}):</div>
              {filteredData.errors.slice(0, 5).map((error, i) => (
                <div key={i} className="text-xs mt-1">{error}</div>
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
        </TabsList>

        <TabsContent value="metrics">
          <SystemMetrics metricsData={filteredData.metricsData} />
        </TabsContent>
        <TabsContent value="charging">
          <ChargingMetrics l2Data={filteredData.l2Data} />
        </TabsContent>
        <TabsContent value="context">
          <StatusContext
            l2MainState={data.l2MainState}
            l2MainContext={data.l2MainContext}
          />
        </TabsContent>
        <TabsContent value="insights">
          <AdditionalInsights l2Data={filteredData.l2Data} metricsData={filteredData.metricsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}