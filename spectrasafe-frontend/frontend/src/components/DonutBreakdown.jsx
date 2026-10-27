export default function DonutBreakdown({ segments, size = 140, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulativeLength = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const fraction = total > 0 ? s.value / total : 0;
      const segLength = fraction * circumference;
      // Gap is the REMAINDER of the circumference, not the full length --
      // this keeps the dash+gap period exactly equal to the path length,
      // which is what makes the offset math below line up correctly.
      const dasharray = `${segLength} ${circumference - segLength}`;
      // Negative offset shifts the pattern's start point FORWARD by the
      // length already consumed by prior segments -- positive/backwards
      // offset (the previous bug) pushes a full-circle segment into its
      // own gap, rendering nothing.
      const dashoffset = -cumulativeLength;
      cumulativeLength += segLength;
      return { ...s, dasharray, dashoffset };
    });

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--color-border-tertiary)" strokeWidth={strokeWidth} fill="none" />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={size / 2} cy={size / 2} r={radius}
          stroke={arc.color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={arc.dasharray}
          strokeDashoffset={arc.dashoffset}
        />
      ))}
    </svg>
  );
}