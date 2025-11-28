import React from "react";

interface Props {
  uv: number;
}

export const UvIndexBadge: React.FC<Props> = ({ uv }) => {
  let color = "#7ee8fa";
  let label = "Low";
  if (uv >= 6 && uv < 8) {
    color = "#facc15";
    label = "Moderate";
  } else if (uv >= 8) {
    color = "#f87171";
    label = "High";
  }
  return (
    <span style={{
      background: color,
      color: "#012",
      borderRadius: 8,
      padding: "2px 8px",
      fontWeight: 600,
      fontSize: 13,
      marginLeft: 8,
    }}>
      UV {uv} ({label})
    </span>
  );
};
