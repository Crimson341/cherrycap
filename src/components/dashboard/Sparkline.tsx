"use client";

import { useId, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  color?: string;
  className?: string;
  showArea?: boolean;
  showDots?: boolean;
  animate?: boolean;
  strokeWidth?: number;
};

type Point = { x: number; y: number; value: number };

function buildPath(points: Point[]) {
  if (points.length === 0) return "";

  const first = points[0];
  if (!first) return "";
  if (points.length === 1) {
    return `M ${first.x} ${first.y}`;
  }

  let d = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function Sparkline({
  data,
  color = "#a78bfa",
  className,
  showArea = true,
  showDots = false,
  animate = true,
  strokeWidth = 2,
}: SparklineProps) {
  const gradientId = useId();
  const width = 200;
  const height = 64;
  const padX = 4;
  const padY = 8;

  const { linePath, areaPath, points, lastPoint } = useMemo(() => {
    const values: number[] =
      data.length > 1
        ? data
        : data.length === 1
          ? [data[0] ?? 0, data[0] ?? 0]
          : [0, 0];

    const min = values.reduce((a, b) => Math.min(a, b), values[0] ?? 0);
    const max = values.reduce((a, b) => Math.max(a, b), values[0] ?? 0);
    const range = max - min || 1;

    const pts: Point[] = values.map((value, index) => {
      const x =
        padX + (index / Math.max(values.length - 1, 1)) * (width - padX * 2);
      const y =
        height - padY - ((value - min) / range) * (height - padY * 2);
      return { x, y, value };
    });

    const line = buildPath(pts);
    const start = pts[0];
    const end = pts[pts.length - 1];
    const area =
      start && end
        ? `${line} L ${end.x} ${height} L ${start.x} ${height} Z`
        : "";

    return {
      linePath: line,
      areaPath: area,
      points: pts,
      lastPoint: end ?? null,
    };
  }, [data]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-full w-full overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {showArea && areaPath && (
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      )}

      {linePath && (
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {showDots &&
        points.map((point, index) => (
          <motion.circle
            key={`${point.x}-${index}`}
            cx={point.x}
            cy={point.y}
            r={2.5}
            fill={color}
            initial={animate ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
          />
        ))}

      {lastPoint && (
        <motion.circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r={3.5}
          fill={color}
          initial={animate ? { scale: 0 } : false}
          animate={{ scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 260, damping: 18 }}
        />
      )}
    </svg>
  );
}
