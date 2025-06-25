"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

const AdditionalInsights = ({ l2MainContext = [], metricsData = [] }) => {
  // Enhanced debug to inspect data structure
  useMemo(() => {
    console.log("metricsData:", JSON.stringify(metricsData, null, 2));
  }, [metricsData]);

  // Prepare data for table
  const tableData = useMemo(() => {
    return metricsData.map((item) => ({
      timestamp: item.timestamp,
      overVoltage: item.flags?.overVoltage || false,
      overCurrent: item.flags?.overCurrent || false,
      overTemp: item.flags?.overTemp || false,
      underVoltage: item.flags?.underVoltage || false,
    }));
  }, [metricsData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800/50 backdrop-blur-lg p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto hover:shadow-2xl transition-shadow duration-300"
      suppressHydrationWarning
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white sticky top-0 bg-white dark:bg-gray-800/50 z-10">
        Flag Events Insights
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">
          Flag Events Table
        </h3>
        {tableData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-2 border text-left text-gray-800 dark:text-gray-200">Timestamp</th>
                  <th className="p-2 border text-left text-gray-800 dark:text-gray-200">Over Voltage</th>
                  <th className="p-2 border text-left text-gray-800 dark:text-gray-200">Over Current</th>
                  <th className="p-2 border text-left text-gray-800 dark:text-gray-200">Over Temperature</th>
                  <th className="p-2 border text-left text-gray-800 dark:text-gray-200">Under Voltage</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-t dark:border-gray-600">
                    <td className="p-2 text-gray-600 dark:text-gray-300">{row.timestamp}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-300">{row.overVoltage.toString()}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-300">{row.overCurrent.toString()}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-300">{row.overTemp.toString()}</td>
                    <td className="p-2 text-gray-600 dark:text-gray-300">{row.underVoltage.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No flag events detected in the data.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              MetricsData entries: {metricsData.length}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(AdditionalInsights, (prevProps, nextProps) => {
  return (
    prevProps.l2MainContext === nextProps.l2MainContext &&
    prevProps.metricsData === nextProps.metricsData
  );
});