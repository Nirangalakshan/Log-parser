// public/logWorker.js
self.onmessage = async (e) => {
  const file = e.data;
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8");

  const parsed = {
    l2Data: [],
    metricsData: [],
    l2MainState: [],
    l2ChildState: [],
    l2MainContext: [],
    l2ChildContext: [],
    memoryUsage: [],
    errors: [],
  };

  const regexes = {
    l2Data: /^(.+?) info: L2\s*Data:\s*({.*?})\s*currentEnergy:\s*(-?\d+(\.\d+)?)/,
    metricsData: /^(.+?) info: MetricsData: ({.*?})/,
    l2MainState: /^(.+?) info: L2Main State: ({.*?})/,
    l2ChildState: /^(.+?) info: L2Child State: ({.*?})/,
    l2MainContext: /^(.+?) info: L2Main Context: ({.*?})/,
    l2ChildContext: /^(.+?) info: L2Child Context: ({.*?})/,
    memory: /^(.+?) info: Memory: ({.*?})/,
  };

  const parseLine = (line, lineNumber) => {
    for (const [key, regex] of Object.entries(regexes)) {
      const match = regex.exec(line);
      if (match) {
        try {
          const json = JSON.parse(match[2]);
          if (key === "l2Data") {
            parsed[key].push({
              timestamp: match[1],
              ...json,
              currentEnergy: parseFloat(match[3]),
            });
          } else {
            const outKey = key === "memory" ? "memoryUsage" : key;
            parsed[outKey].push({ timestamp: match[1], ...json });
          }
        } catch (err) {
          parsed.errors.push(`Line ${lineNumber}: Error parsing ${key} - ${err.message}`);
        }
        break;
      }
    }
  };

  let lineNumber = 0;
  let chunk = "";
  let { value, done } = await reader.read();

  while (!done) {
    chunk += decoder.decode(value, { stream: true });
    const lines = chunk.split(/\r?\n/);
    chunk = lines.pop(); // partial

    for (let line of lines) {
      lineNumber++;
      parseLine(line, lineNumber);
      if (lineNumber % 2000 === 0) {
        self.postMessage({ type: "progress", line: lineNumber });
      }
    }

    ({ value, done } = await reader.read());
  }

  if (chunk.trim()) {
    lineNumber++;
    parseLine(chunk, lineNumber);
  }

  self.postMessage({ type: "done", data: parsed });
};
