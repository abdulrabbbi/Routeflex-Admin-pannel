export const STATUS_COLORS = {
  completed: { fill: "#16a34a", stroke: "#22c55e" },   // green-600
  inProgress: { fill: "#f59e0b", stroke: "#b45309" }, // amber-500
  cancelled: { fill: "#ef4444", stroke: "#b91c1c" },  // red-500
  total: { stroke: "#334155" },                       // slate-700
};


export const FEEDBACK_COLORS = {
  positive: { fill: STATUS_COLORS.completed.fill,  stroke: STATUS_COLORS.completed.stroke },
  neutral:  { fill: STATUS_COLORS.inProgress.fill, stroke: STATUS_COLORS.inProgress.stroke },
  negative: { fill: STATUS_COLORS.cancelled.fill,  stroke: STATUS_COLORS.cancelled.stroke },
};