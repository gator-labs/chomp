import React from "react";
import { Pie } from "react-chartjs-2";

// interface Dataset {
//   data: (string | number)[];
//   backgroundColor: string[];
//   hoverBackgroundColor: string[];
//   borderColor: string[];
//   borderAlign: string;
//   hoverOffset: number;
//   borderWidth: number;
// }

// interface ChartData {
//   labels: string[];
//   datasets: Dataset[];
// }

function PieChart({ data }: { data: any }) {
  const options = {
    layout: {
      padding: 16,
    },
    plugins: {
      responsive: true,
      legend: {
        display: false, // This hides the legend
      },
      tooltip: {
        backgroundColor: "#1D1D1D",
        caretSize: 0,
        displayColors: false,
        titleColor: "#CCC",
        bodyColor: "#CCC",
      },
      interaction: {
        mode: "nearest", // Ensures precise hover interactions
        intersect: true,
      },
    },
  };
  return (
    <div className="w-[288px] h-[288px]">
      {" "}
      <Pie data={data} options={options} />
    </div>
  );
}

export default PieChart;
