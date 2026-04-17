"use client";

interface BarChartProps {
  scores: Record<string, number>;
  colors: Record<string, string>;
}

export function BarChart({ scores, colors }: BarChartProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(([name, score]) => (
          <div key={name}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-2)",
                }}
              >
                {name}
              </span>
              <span
                style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}
              >
                {score}
              </span>
            </div>
            <div
              style={{
                height: 8,
                background: "var(--border)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${score}%`,
                  background: colors[name] ?? "var(--blue)",
                  borderRadius: 4,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}
