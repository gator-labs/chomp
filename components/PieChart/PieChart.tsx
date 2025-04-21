import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import React from "react";
import { Pie } from "react-chartjs-2";

interface Dataset {
  data: (string | number)[];
  backgroundColor: string[];
  hoverBackgroundColor: string[];
  borderColor: string[];
  hoverOffset: number;
  borderWidth: number;
}

interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ data }: { data: ChartData }) {
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
        callbacks: {
          label: function (context: any) {
            const dataset = context.dataset.data;
            const total = dataset.reduce(
              (acc: number, val: number) => acc + val,
              0,
            );
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`;
          },
        },
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
    <div className="w-[288px] h-[288px] m-auto">
      <Pie data={data} options={options} />
    </div>
  );
}

export default PieChart;
