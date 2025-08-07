import React, { useState } from "react";
import { WaterSystemLayout } from '../../components/hercules-sfms/WaterSystemLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Package, 
  Shapes, 
  TrendingUp, 
  Calendar,
  Filter 
} from "lucide-react";

export function KPIDashboard() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    product: "",
    batch: "",
    material: "",
  });

  const kpis = [
    {
      title: "Total Batches",
      value: "2,596",
      unit: "batches",
      icon: Activity,
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-[0_0_20px_rgba(0,255,255,0.3)]",
    },
    {
      title: "Total Materials",
      value: "36,157",
      unit: "kg",
      icon: Package,
      color: "from-yellow-500 to-orange-500",
      glow: "shadow-[0_0_20px_rgba(255,193,7,0.3)]",
    },
    {
      title: "Unique Products",
      value: "59",
      unit: "types",
      icon: Shapes,
      color: "from-purple-500 to-pink-500",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    },
    {
      title: "Avg Batches/Product",
      value: "44.0",
      unit: "",
      icon: TrendingUp,
      color: "from-emerald-500 to-green-500",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    },
    {
      title: "Latest Batch Date",
      value: "Jun 28, 2025",
      unit: "",
      icon: Calendar,
      color: "from-slate-500 to-gray-500",
      glow: "shadow-[0_0_20px_rgba(148,163,184,0.3)]",
    },
  ];

  return (
    <WaterSystemLayout>
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-cyan-300 tracking-wide">
          KPI Dashboard
        </h1>

        {/* Filters */}
        <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-slate-700 dark:border-slate-700 border-slate-300">
          <CardHeader>
            <CardTitle className="text-cyan-300 dark:text-cyan-300 text-slate-700 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Dashboard Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="bg-slate-800 dark:bg-slate-800 bg-white border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900 h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 text-sm">End Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="bg-slate-800 dark:bg-slate-800 bg-white border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900 h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 text-sm">Product</Label>
                <select 
                  value={filters.product}
                  onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                  className="w-full px-3 py-2 h-9 rounded-md bg-slate-800 dark:bg-slate-800 bg-white border border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                >
                  <option value="">All Products</option>
                  <option>FM Ruminant 13%</option>
                  <option>PMX Special</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 text-sm">Batch</Label>
                <select 
                  value={filters.batch}
                  onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                  className="w-full px-3 py-2 h-9 rounded-md bg-slate-800 dark:bg-slate-800 bg-white border border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                >
                  <option value="">All Batches</option>
                  <option>PMX lot0168</option>
                  <option>PMX lot0169</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 dark:text-slate-300 text-slate-600 text-sm">Material</Label>
                <select 
                  value={filters.material}
                  onChange={(e) => setFilters({ ...filters, material: e.target.value })}
                  className="w-full px-3 py-2 h-9 rounded-md bg-slate-800 dark:bg-slate-800 bg-white border border-slate-600 dark:border-slate-600 border-slate-300 text-white dark:text-white text-slate-900"
                >
                  <option value="">All Materials</option>
                  <option>Cobalt Proteinate 10%</option>
                  <option>Zinc Oxide</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-9 px-6">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const IconComponent = kpi.icon;
            return (
              <Card key={kpi.title} className={`group relative bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-slate-700 dark:border-slate-700 border-slate-300 ${kpi.glow} hover:scale-[1.02] transition-all duration-300 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-slate-400 dark:text-slate-400 text-slate-600 text-xs font-medium uppercase tracking-wider mb-1">{kpi.title}</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-white dark:text-white text-slate-900 leading-none">{kpi.value}</p>
                        {kpi.unit && <span className="text-slate-400 dark:text-slate-400 text-slate-600 text-xs font-medium">{kpi.unit}</span>}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${kpi.color} rounded-full transition-all duration-1000 ease-out`} style={{width: '75%'}}></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-cyan-500/30 dark:border-cyan-500/30 border-slate-300 shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-300 dark:text-cyan-300 text-slate-700 text-sm font-semibold flex items-center gap-2">
                Material Weight per Day
                <div className="ml-auto flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                  <span>Material Dosed (tons)</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[180px]">
                <svg viewBox="0 0 320 160" className="w-full h-full">
                  {/* Bar Chart */}
                  {[120, 340, 260, 400, 310, 290, 180].map((value, i) => {
                    const height = (value / 400) * 100;
                    const dates = ['Jun 01', 'Jun 02', 'Jun 03', 'Jun 04', 'Jun 05', 'Jun 06', 'Jun 07'];
                    return (
                      <g key={i}>
                        <rect
                          x={i * 42 + 20}
                          y={120 - height}
                          width={28}
                          height={height}
                          fill="#00bfff"
                          className="hover:opacity-80 transition-opacity"
                        />
                        <text x={i * 42 + 34} y={140} className="fill-slate-400 dark:fill-slate-400 fill-slate-600 text-[10px]" textAnchor="middle">{dates[i]}</text>
                        <text x={i * 42 + 34} y={115 - height} className="fill-cyan-400 dark:fill-cyan-400 fill-slate-700 text-[10px] font-bold" textAnchor="middle">{value}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-cyan-500/30 dark:border-cyan-500/30 border-slate-300 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-cyan-300 dark:text-cyan-300 text-slate-700 text-sm font-semibold flex items-center justify-between">
                Production Summary
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  <span>Production Output</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[180px]">
                <svg viewBox="0 0 360 160" className="w-full h-full">
                  <defs>
                    <linearGradient id="cyanLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#0891b2" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <filter id="lineGlow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Grid lines - horizontal */}
                  {[44000, 46000, 48000, 50000, 52000, 54000, 56000, 58000, 60000, 62000].map((value, i) => {
                    const y = 140 - ((value - 44000) / 18000) * 120;
                    return (
                      <g key={value}>
                        <line x1="50" y1={y} x2="320" y2={y} stroke="#374151" strokeWidth="0.5" opacity="0.3" />
                        <text x="40" y={y + 3} className="fill-slate-400 dark:fill-slate-400 fill-slate-600 text-[9px]" textAnchor="end">{(value/1000).toFixed(0)}.000</text>
                      </g>
                    );
                  })}
                  
                  {/* Grid lines - vertical */}
                  {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map((time, i) => {
                    const x = 50 + (i * 54);
                    return (
                      <g key={time}>
                        <line x1={x} y1="20" x2={x} y2="140" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
                        <text x={x} y="155" className="fill-slate-400 dark:fill-slate-400 fill-slate-600 text-[9px]" textAnchor="middle">{time}</text>
                      </g>
                    );
                  })}
                  
                  {/* Data line with actual production values */}
                  <path
                    d="M 50,115 L 104,85 L 158,110 L 212,25 L 266,55 L 320,85"
                    stroke="url(#cyanLineGradient)"
                    strokeWidth="3"
                    fill="none"
                    filter="url(#lineGlow)"
                    className="drop-shadow-lg"
                  />
                  
                  {/* Data points with values */}
                  {[
                    {x: 50, y: 115, value: 45000},
                    {x: 104, y: 85, value: 51000},
                    {x: 158, y: 110, value: 47000},
                    {x: 212, y: 25, value: 61000},
                    {x: 266, y: 55, value: 58000},
                    {x: 320, y: 85, value: 55000}
                  ].map((point, i) => (
                    <g key={i}>
                      <circle 
                        cx={point.x} 
                        cy={point.y} 
                        r="5" 
                        fill="#06b6d4" 
                        stroke="#0891b2" 
                        strokeWidth="2"
                        filter="url(#lineGlow)"
                        className="drop-shadow-lg hover:r-6 transition-all cursor-pointer" 
                      />
                      <circle cx={point.x} cy={point.y} r="8" fill="#06b6d4" opacity="0.2" />
                    </g>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-emerald-500/30 dark:border-emerald-500/30 border-slate-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-300 dark:text-emerald-300 text-slate-700 text-sm font-semibold">Quantity by Tons</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[180px] flex items-center justify-center">
                <div className="flex items-center gap-8">
                  <svg viewBox="0 0 200 200" className="w-36 h-36">
                    <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)"/>
                      </filter>
                    </defs>
                    
                    {/* Product A - 45% (162 degrees) - Teal */}
                    <path
                      d="M 100,100 L 100,15 A 85,85 0 0,1 175.5,55.9 Z"
                      fill="#10b981"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      filter="url(#shadow)"
                    />
                    
                    {/* Product B - 30% (108 degrees) - Blue */}
                    <path
                      d="M 100,100 L 175.5,55.9 A 85,85 0 0,1 24.5,144.1 Z"
                      fill="#3b82f6"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      filter="url(#shadow)"
                    />
                    
                    {/* Product C - 25% (90 degrees) - Pink */}
                    <path
                      d="M 100,100 L 24.5,144.1 A 85,85 0 0,1 100,15 Z"
                      fill="#ec4899"
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      filter="url(#shadow)"
                    />
                  </svg>
                  
                  {/* Legend */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                      <span className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">Product A</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">Product B</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-pink-500"></div>
                      <span className="text-slate-300 dark:text-slate-300 text-slate-600 font-medium">Product C</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-full md:col-span-2 bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-blue-500/30 dark:border-blue-500/30 border-slate-300 shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-300 dark:text-blue-300 text-slate-700 text-sm font-semibold">No. Batches by Weekday</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px]">
                <svg viewBox="0 0 500 180" className="w-full h-full">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
                    const values = [505, 443, 441, 416, 221, 355, 131];
                    const colors = ['#3b82f6', '#f97316', '#ef4444', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];
                    const height = (values[i] / 600) * 120;
                    return (
                      <g key={i}>
                        <rect
                          x={i * 65 + 30}
                          y={140 - height}
                          width={50}
                          height={height}
                          fill={colors[i]}
                          className="hover:opacity-80 transition-opacity"
                        />
                        <text x={i * 65 + 55} y={160} className="fill-slate-400 dark:fill-slate-400 fill-slate-600 text-[10px]" textAnchor="middle">{day}</text>
                        <text x={i * 65 + 55} y={135 - height} className="fill-white dark:fill-white fill-slate-900 text-[11px] font-bold" textAnchor="middle">{values[i]}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/95 dark:bg-slate-900/95 bg-white/95 border-purple-500/30 dark:border-purple-500/30 border-slate-300 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-300 dark:text-purple-300 text-slate-700 text-sm font-semibold">Efficiency & Complexity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[200px]">
                <svg viewBox="0 0 300 180" className="w-full h-full">
                  {/* Horizontal bar chart */}
                  {[
                    { label: 'FM Meat Meal CB Raw', value: 95, color: '#3b82f6' },
                    { label: 'All Combat Lam', value: 70, color: '#f97316' },
                    { label: 'FM Ruminant 13%', value: 85, color: '#10b981' },
                    { label: 'FM Layer Mash 17%', value: 60, color: '#8b5cf6' },
                    { label: 'FM Dual 25 Mash', value: 90, color: '#06b6d4' },
                    { label: 'PMX DD300 Broiler 30+ kg', value: 40, color: '#ef4444' },
                    { label: 'PMX DD3000 Layer 35+ kg', value: 80, color: '#f59e0b' }
                  ].map((item, i) => (
                    <g key={i}>
                      <rect
                        x="120"
                        y={i * 20 + 10}
                        width={(item.value / 100) * 150}
                        height="12"
                        fill={item.color}
                        className="hover:opacity-80 transition-opacity"
                      />
                      <text x="115" y={i * 20 + 19} className="fill-slate-300 dark:fill-slate-300 fill-slate-600 text-[9px]" textAnchor="end">{item.label}</text>
                      <text x="275" y={i * 20 + 19} className="fill-slate-400 dark:fill-slate-400 fill-slate-600 text-[9px]" textAnchor="start">{item.value}%</text>
                    </g>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WaterSystemLayout>
  );
}