import React, { useState, useMemo, useEffect } from "react";
import { WaterSystemLayout } from '../../components/hercules-sfms/WaterSystemLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Printer, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { apiService, transformBackendData, aggregateByProduct, aggregateByMaterial, ReportFilters } from '@/lib/api';

const tabs = [
  "Product Batch Summary",
  "NFM Weekly", 
  "NFM Monthly",
  "Daily Report",
  "Detailed Report",
  "Material Consumption Report",
  "Total Material Consumption",
];

export function Reports() {
  const [startDate, setStartDate] = useState("2025-06-01T07:00");
  const [endDate, setEndDate] = useState("2025-06-30T07:00");
  const [activeTab, setActiveTab] = useState("Product Batch Summary");

  // Pending filter values (UI)
  const [pendingProduct, setPendingProduct] = useState("");
  const [pendingBatch, setPendingBatch] = useState("");
  const [pendingMaterial, setPendingMaterial] = useState("");
  const [pendingStartDate, setPendingStartDate] = useState(startDate);
  const [pendingEndDate, setPendingEndDate] = useState(endDate);

  // Applied filter values (used for filtering)
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState(startDate);
  const [appliedEndDate, setAppliedEndDate] = useState(endDate);

  // Data and loading states
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: ReportFilters = {
        startDate: appliedStartDate,
        endDate: appliedEndDate,
        batch: selectedBatch ? [selectedBatch] : undefined,
        product: selectedProduct ? [selectedProduct] : undefined,
        material: selectedMaterial ? [selectedMaterial] : undefined,
        limit: 10000 // Large limit to get all data
      };

      let response;
      
      if (activeTab === "Detailed Report" || activeTab === "Product Batch Summary") {
        response = await apiService.getKPIData(filters);
      } else if (activeTab === "NFM Weekly") {
        response = await apiService.getReportData(filters, 'weekly');
      } else if (activeTab === "NFM Monthly") {
        response = await apiService.getReportData(filters, 'monthly');
      } else if (activeTab === "Daily Report") {
        response = await apiService.getReportData(filters, 'daily');
      } else {
        response = await apiService.getKPIData(filters);
      }

      const transformedData = transformBackendData(response.data);
      setRawData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [activeTab, appliedStartDate, appliedEndDate, selectedProduct, selectedBatch, selectedMaterial]);

  // Get unique values for filter dropdowns
  const productOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((item: any) => {
      if (item.productName) set.add(item.productName);
    });
    return Array.from(set);
  }, [rawData]);

  const batchOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((item: any) => {
      if (item.batchName) set.add(item.batchName);
    });
    return Array.from(set);
  }, [rawData]);

  const materialOptions = useMemo(() => {
    const set = new Set<string>();
    rawData.forEach((item: any) => {
      if (item.materialName) set.add(item.materialName);
    });
    return Array.from(set);
  }, [rawData]);

  // Filtering logic (use applied filter values)
  const filteredData = useMemo(() => {
    // For Product Batch Summary and Detailed Report, show all data by default (no filters)
    if ((activeTab === "Product Batch Summary" || activeTab === "Detailed Report") && !selectedProduct && !selectedBatch && !selectedMaterial && appliedStartDate === startDate && appliedEndDate === endDate) {
      return rawData;
    }
    return rawData.filter((item: any) => {
      // Date filtering (if item has batchStart or batchEnd or date)
      let dateMatch = true;
      if (item.batchStart || item.date) {
        const itemDate = new Date(item.batchStart || item.date);
        const start = new Date(appliedStartDate);
        const end = new Date(appliedEndDate);
        dateMatch = itemDate >= start && itemDate <= end;
      }
      // Product filter
      const productMatch = selectedProduct ? item.productName === selectedProduct : true;
      // Batch filter
      const batchMatch = selectedBatch ? item.batchName === selectedBatch : true;
      // Material filter
      const materialMatch = selectedMaterial ? item.materialName === selectedMaterial : true;
      return dateMatch && productMatch && batchMatch && materialMatch;
    });
  }, [rawData, appliedStartDate, appliedEndDate, selectedProduct, selectedBatch, selectedMaterial, activeTab, startDate, endDate]);

  // Generate aggregated data for summary reports
  const dailyData = useMemo(() => aggregateByProduct(filteredData, 'day'), [filteredData]);
  const weeklyData = useMemo(() => aggregateByProduct(filteredData, 'week'), [filteredData]);
  const monthlyData = useMemo(() => aggregateByProduct(filteredData, 'month'), [filteredData]);
  const materialData = useMemo(() => aggregateByMaterial(filteredData), [filteredData]);

  // Group by batch for Detailed Report
  const detailedBatchGroups = useMemo(() => {
    if (activeTab !== "Detailed Report") return [];
    const groups: Record<string, any[]> = {};
    filteredData.forEach((item: any) => {
      if (!groups[item.batchName]) groups[item.batchName] = [];
      groups[item.batchName].push(item);
    });
    return Object.values(groups);
  }, [filteredData, activeTab]);

  // Handler for VIEW button
  const applyFilters = () => {
    setSelectedProduct(pendingProduct);
    setSelectedBatch(pendingBatch);
    setSelectedMaterial(pendingMaterial);
    setAppliedStartDate(pendingStartDate);
    setAppliedEndDate(pendingEndDate);
  };

  // When tab changes, reset pending and applied filters
  useEffect(() => {
    setPendingProduct("");
    setPendingBatch("");
    setPendingMaterial("");
    setSelectedProduct("");
    setSelectedBatch("");
    setSelectedMaterial("");
    setPendingStartDate(startDate);
    setPendingEndDate(endDate);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  }, [activeTab]);

  const getTableHeaders = (tabName: string) => {
    switch (tabName) {
      case "Product Batch Summary":
        return ["Batch Name", "Product Name", "Batch Start", "Batch End", "Batch Quantity", "Material Name", "Material Code", "SetPoint", "Actual", "Order ID"];
      case "NFM Weekly":
      case "NFM Monthly":
      case "Daily Report":
        return ["Product Name", "No Of Batches", "Sum SP", "Sum Act", "Err Kg", "Err %"];
      case "Detailed Report":
        return ["Batch", "Material Name", "Code", "Set Point", "Actual", "Err Kg", "Err %"];
      case "Material Consumption Report":
      case "Total Material Consumption":
        return ["Material Name", "Code", "Planned (kg)", "Actual (kg)", "Difference %"];
      default:
        return [];
    }
  };

  const getPercentClass = (value: any) => {
    if (typeof value !== 'number') return '';
    return value < 0 ? 'text-red-400' : 'text-green-400';
  };

  const renderTableRow = (item: any, tabName: string, index: number, batchGroup = null, isFirstMaterial = false, rowSpan = 1) => {
    switch (tabName) {
      case "Product Batch Summary":
        return (
          <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/40">
            <td className="px-4 py-2 text-cyan-300 font-mono text-sm">{item.batchName}</td>
            <td className="px-4 py-2 text-white text-sm">{item.productName}</td>
            <td className="px-4 py-2 text-blue-400 text-sm">{item.batchStart}</td>
            <td className="px-4 py-2 text-blue-400 text-sm">{item.batchEnd}</td>
            <td className="px-4 py-2 text-cyan-400 text-sm">{item.batchQuantity}</td>
            <td className="px-4 py-2 text-green-400 text-sm">{item.materialName}</td>
            <td className="px-4 py-2 text-purple-400 font-mono text-sm">{item.materialCode}</td>
            <td className="px-4 py-2 text-orange-400 text-sm">{item.setPoint?.toFixed(2) || '-'}</td>
            <td className="px-4 py-2 text-blue-400 text-sm">{item.actual?.toFixed(2) || '-'}</td>
            <td className="px-4 py-2 text-cyan-300 font-mono text-sm">{item.orderId}</td>
          </tr>
        );
      case "NFM Weekly":
      case "NFM Monthly":
      case "Daily Report":
        return (
          <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/40">
            <td className="px-4 py-2 text-white text-sm">{item.productName}</td>
            <td className="px-4 py-2 text-cyan-400 text-sm">{item.noOfBatches}</td>
            <td className="px-4 py-2 text-green-400 text-sm">{item.sumSP?.toFixed(2) || '-'}</td>
            <td className="px-4 py-2 text-blue-400 text-sm">{item.sumAct?.toFixed(2) || '-'}</td>
            <td className="px-4 py-2 text-orange-400 text-sm">{item.errKg || '-'}</td>
            <td className={`px-4 py-2 text-sm ${getPercentClass(item.errPercent)}`}>{item.errPercent ? `${item.errPercent}%` : '-'}</td>
          </tr>
        );
      case "Detailed Report":
        return (
          <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/40">
            {isFirstMaterial && (
              <td rowSpan={rowSpan} className="px-4 py-2 align-top bg-slate-800/60 text-cyan-200 text-sm font-semibold whitespace-pre-line">
                Batch : {batchGroup.batchName}\nProduct : {batchGroup.productName}\nStarted: {batchGroup.batchStart}\nEnded: {batchGroup.batchEnd}\nQuantity: {batchGroup.batchQuantity}
              </td>
            )}
            <td className="px-4 py-2 text-green-400 text-sm">{item.materialName}</td>
            <td className="px-4 py-2 text-purple-400 font-mono text-sm">{item.materialCode}</td>
            <td className="px-4 py-2 text-orange-400 text-sm">{item.setPoint?.toFixed(2) || '-'}</td>
            <td className="px-4 py-2 text-blue-400 text-sm">{item.actual?.toFixed(2) || '-'}</td>
            <td className="px-4 py-2 text-orange-400 text-sm">{item.errKg || '-'}</td>
            <td className={`px-4 py-2 text-sm ${getPercentClass(item.errPercent)}`}>{item.errPercent ? `${item.errPercent}%` : '-'}</td>
          </tr>
        );
      case "Material Consumption Report":
      case "Total Material Consumption":
        return (
          <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-800/40">
            <td className="px-4 py-2 text-green-400 text-sm">{item.materialName}</td>
            <td className="px-4 py-2 text-purple-400 font-mono text-sm">{item.code}</td>
            <td className="px-4 py-2 text-orange-400 text-sm">{item.plannedKG?.toFixed(2) || '-'}</td>
            <td className="px-4 py-2 text-blue-400 text-sm">{item.actualKG?.toFixed(2) || '-'}</td>
            <td className={`px-4 py-2 text-sm ${getPercentClass(item.differencePercent)}`}>{item.differencePercent ? `${item.differencePercent}%` : '-'}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      <span className="ml-2 text-slate-300">Loading report data...</span>
    </div>
  );

  // Error component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center py-8">
      <AlertCircle className="h-8 w-8 text-red-400 mr-2" />
      <span className="text-red-400">{message}</span>
    </div>
  );

  return (
    <WaterSystemLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FileText className="text-cyan-400 text-2xl" />
          <h1 className="text-2xl font-bold text-cyan-300 tracking-wide">
            Production Reports
          </h1>
        </div>

        {/* Filter Section */}
        <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-slate-700 dark:border-slate-700 border-slate-300">
          <CardHeader>
            <CardTitle className="text-cyan-300 dark:text-cyan-300 text-slate-700 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">Start Date:</Label>
                <Input
                  type="datetime-local"
                  value={pendingStartDate}
                  onChange={(e) => setPendingStartDate(e.target.value)}
                  className="bg-slate-800 dark:bg-slate-800 bg-white border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">End Date:</Label>
                <Input
                  type="datetime-local"
                  value={pendingEndDate}
                  onChange={(e) => setPendingEndDate(e.target.value)}
                  className="bg-slate-800 dark:bg-slate-800 bg-white border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">Select Product:</Label>
                <select
                  className="w-full px-3 py-2 rounded-md bg-slate-800 dark:bg-slate-800 bg-white border border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                  value={pendingProduct}
                  onChange={e => setPendingProduct(e.target.value)}
                >
                  <option value="">Select Product</option>
                  {productOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">Select Batch:</Label>
                <select
                  className="w-full px-3 py-2 rounded-md bg-slate-800 dark:bg-slate-800 bg-white border border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                  value={pendingBatch}
                  onChange={e => setPendingBatch(e.target.value)}
                >
                  <option value="">Select Batch</option>
                  {batchOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">Select Material:</Label>
                <select
                  className="w-full px-3 py-2 rounded-md bg-slate-800 dark:bg-slate-800 bg-white border border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                  value={pendingMaterial}
                  onChange={e => setPendingMaterial(e.target.value)}
                >
                  <option value="">Select Material</option>
                  {materialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" 
                onClick={applyFilters}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                VIEW
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Type Tabs */}
        <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-slate-700 dark:border-slate-700 border-slate-300">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2 justify-start">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-xs rounded-md font-semibold transition-all border whitespace-nowrap
                    ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md border-transparent"
                        : "bg-transparent border border-slate-600 dark:border-slate-600 border-slate-400 text-white dark:text-white text-slate-700 hover:border-cyan-400"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
            <Printer className="h-4 w-4 mr-2" />
            PRINT
          </Button>
          <Button className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600">
            <Download className="h-4 w-4 mr-2" />
            EXPORT TO CSV
          </Button>
        </div>

        {/* Data Table */}
        <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-slate-700 dark:border-slate-700 border-slate-300">
          <CardContent className="p-0">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-white dark:text-white text-slate-900 border-collapse">
                  <thead className="bg-slate-800 dark:bg-slate-800 bg-slate-200 text-cyan-400 dark:text-cyan-400 text-slate-700 uppercase text-xs tracking-wider">
                    <tr>
                      {getTableHeaders(activeTab).map((header) => (
                        <th key={header} className="border border-slate-600 dark:border-slate-600 border-slate-300 px-4 py-3">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "Detailed Report"
                      ? detailedBatchGroups.map((group, groupIdx) =>
                          group.map((item: any, i: number) =>
                            renderTableRow(
                              item,
                              activeTab,
                              `${groupIdx}-${i}`,
                              group[0],
                              i === 0,
                              group.length
                            )
                          )
                        )
                      : activeTab === "NFM Weekly"
                      ? weeklyData.map((item: any, i: number) =>
                          renderTableRow(item, activeTab, i)
                        )
                      : activeTab === "NFM Monthly"
                      ? monthlyData.map((item: any, i: number) =>
                          renderTableRow(item, activeTab, i)
                        )
                      : activeTab === "Daily Report"
                      ? dailyData.map((item: any, i: number) =>
                          renderTableRow(item, activeTab, i)
                        )
                      : activeTab === "Material Consumption Report" || activeTab === "Total Material Consumption"
                      ? materialData.map((item: any, i: number) =>
                          renderTableRow(item, activeTab, i)
                        )
                      : filteredData.map((item: any, i: number) =>
                          renderTableRow(item, activeTab, i)
                        )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WaterSystemLayout>
  );
}