import React, { useState, useEffect } from "react";
import { WaterSystemLayout } from '../../components/hercules-sfms/WaterSystemLayout';
import { Calendar, Package, BarChart3, Loader2, AlertCircle } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService, CalendarData } from '@/lib/api';

export function BatchCalendar() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // Fetch calendar data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchCalendarData();
    }
  }, [startDate, endDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getCalendarData(startDate, endDate);
      setCalendarData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendar data';
      setError(errorMessage);
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar grid data from API response
  const generateCalendarGrid = () => {
    if (!calendarData.length) return [];

    // Create a map of dates to data
    const dateMap = new Map();
    calendarData.forEach(item => {
      dateMap.set(item.date, item);
    });

    // Generate calendar grid for the selected date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const grid = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const data = dateMap.get(dateStr);
      
      if (data) {
        grid.push({
          day: d.toLocaleDateString('en-US', { weekday: 'long' }),
          date: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
          ton: Math.round(data.total_actual_ton * 100) / 100, // Round to 2 decimal places
          products: data.product_count,
          batchCount: data.batch_count,
          actualKG: data.total_actual_kg
        });
      } else {
        grid.push({
          day: d.toLocaleDateString('en-US', { weekday: 'long' }),
          date: `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
          ton: 0,
          products: 0,
          batchCount: 0,
          actualKG: 0
        });
      }
    }

    return grid;
  };

  const filteredData = generateCalendarGrid();

  return (
    <WaterSystemLayout>
      <div className="space-y-6">
        {/* Header with Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title with Icon */}
          <div className="flex items-center gap-3">
            <Calendar className="text-cyan-400 text-2xl" />
            <h1 className="text-2xl font-bold text-cyan-300 tracking-wide">
              Batch Calendar
            </h1>
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col">
              <Label className="text-sm text-cyan-300 mb-1 font-medium">
                Start Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div className="flex flex-col">
              <Label className="text-sm text-cyan-300 mb-1 font-medium">
                End Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            <span className="ml-2 text-cyan-400">Loading calendar data...</span>
          </div>
        )}

        {/* Calendar Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border border-slate-700 dark:border-slate-700 border-slate-300 shadow-md transition-all
                  hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:border-cyan-400
                  ${item.ton === 0 ? "opacity-80" : ""}`}
              >
                {/* Day & Date */}
                <div className="text-white dark:text-white text-slate-900 font-semibold border-b border-slate-500 dark:border-slate-500 border-slate-300 pb-1 mb-3">
                  <div className="text-sm">{item.day}</div>
                  <div className="text-base">{item.date}</div>
                </div>

                {/* Tons */}
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3
                    className={`text-lg ${
                      item.ton === 0 ? "text-red-500" : "text-green-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      item.ton === 0 ? "text-red-500" : "text-green-400"
                    }`}
                  >
                    {item.ton} ton
                  </span>
                </div>

                {/* Products */}
                <div className="flex items-center gap-2 mb-2">
                  <Package className="text-blue-400 text-md" />
                  <span className="text-blue-400 text-sm">
                    {item.products} products
                  </span>
                </div>

                {/* Batches */}
                <div className="flex items-center gap-2">
                  <Calendar className="text-purple-400 text-md" />
                  <span className="text-purple-400 text-sm">
                    {item.batchCount} batches
                  </span>
                </div>

                {/* Actual KG (small text) */}
                <div className="mt-2 text-xs text-slate-400">
                  {item.actualKG.toFixed(0)} kg
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Data Message */}
        {!loading && !error && filteredData.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No calendar data available for the selected date range.</p>
          </div>
        )}
      </div>
    </WaterSystemLayout>
  );
}