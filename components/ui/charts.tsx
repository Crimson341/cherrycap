"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-xl">
        <p className="text-neutral-400 text-xs mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white text-sm font-medium">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Traffic Area Chart
interface TrafficDataPoint {
  name: string;
  visitors: number;
  pageViews: number;
}

export function TrafficAreaChart({ data }: { data: TrafficDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Visitors"
          stroke="#f43f5e"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVisitors)"
        />
        <Area
          type="monotone"
          dataKey="pageViews"
          name="Page Views"
          stroke="#3b82f6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorPageViews)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Performance Line Chart
interface PerformanceDataPoint {
  name: string;
  loadTime: number;
  ttfb: number;
  fcp: number;
}

export function PerformanceLineChart({ data }: { data: PerformanceDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="loadTime"
          name="Load Time"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: "#22c55e" }}
        />
        <Line
          type="monotone"
          dataKey="ttfb"
          name="TTFB"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: "#f59e0b" }}
        />
        <Line
          type="monotone"
          dataKey="fcp"
          name="FCP"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: "#8b5cf6" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Traffic Sources Bar Chart
interface TrafficSourceDataPoint {
  name: string;
  value: number;
}

export function TrafficSourcesBarChart({ data }: { data: TrafficSourceDataPoint[] }) {
  const colors = ["#f43f5e", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"];
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
        <XAxis 
          type="number" 
          stroke="#525252" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke="#525252" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name="Visitors" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Device Distribution Pie Chart
interface DeviceDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export function DeviceDistributionChart({ data }: { data: DeviceDataPoint[] }) {
  const colors = ["#f43f5e", "#3b82f6", "#22c55e", "#f59e0b"];
  
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Real-time visitors sparkline
interface SparklineDataPoint {
  value: number;
}

export function RealtimeSparkline({ data }: { data: SparklineDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#sparklineGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Page Performance Bar Chart (horizontal bars for top pages)
interface PagePerformanceDataPoint {
  page: string;
  views: number;
  avgTime: number;
}

export function PagePerformanceChart({ data }: { data: PagePerformanceDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
        <XAxis 
          type="number" 
          stroke="#525252" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          type="category" 
          dataKey="page" 
          stroke="#525252" 
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="views" name="Views" fill="#f43f5e" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Bounce Rate Trend
interface BounceRateDataPoint {
  name: string;
  rate: number;
}

export function BounceRateTrendChart({ data }: { data: BounceRateDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#525252" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="rate"
          name="Bounce Rate"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ fill: "#f59e0b", strokeWidth: 0, r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
