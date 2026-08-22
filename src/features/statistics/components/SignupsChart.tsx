import { useState } from 'react';
import type { SignupDay } from '../api';

function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// A dependency-free SVG line — not a charting library — ADMIN.md only rules
// out the latter. Line over bar because "over time" is a trend question
// (is it going up), which a connected line reads better than isolated bars.
//
// Dots are real HTML elements positioned by percentage, not SVG circles
// inside the stretched viewBox — a non-uniformly scaled SVG circle renders
// as an ellipse, not a circle. The line itself uses
// vector-effect="non-scaling-stroke" for the same reason (keeps the stroke
// width from stretching). Tooltips are React-controlled, not SVG <title> —
// the latter's hit area and appearance are unreliable across browsers.
export function SignupsChart({ data }: { data: SignupDay[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // api returns newest-first (for the old table's sort); a line chart reads
  // left-to-right chronologically.
  const chronological = [...data].reverse();
  const max = Math.max(...chronological.map((day) => day.count));

  const points = chronological.map((day, i) => ({
    x: chronological.length === 1 ? 50 : (i / (chronological.length - 1)) * 100,
    y: 100 - (day.count / max) * 90, // 10% headroom above the peak
    day,
  }));

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPoints = `0,100 ${linePoints} 100,100`;

  return (
    <div>
      <div className="relative h-40 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <polygon points={areaPoints} fill="#FFB40022" stroke="none" />
          <polyline
            points={linePoints}
            fill="none"
            stroke="#FFB400"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        {points.map((p, i) => (
          <div
            key={p.day.date}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="size-2.5 rounded-full border-2 border-[#FFB400] bg-background" />
            {hoveredIndex === i && (
              <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-center shadow-md">
                <div className="text-sm font-semibold text-popover-foreground">{p.day.count}</div>
                <div className="text-xs text-muted-foreground">{formatShortDate(p.day.date)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatShortDate(chronological[0].date)}</span>
        <span>{formatShortDate(chronological[chronological.length - 1].date)}</span>
      </div>
    </div>
  );
}
