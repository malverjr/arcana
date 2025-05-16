import React from "react";
import ReactECharts from "echarts-for-react";

const SentimentalChart = () => {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}%",
    },
    legend: {
      show: false,
    },
    series: [
      {
        name: "Mapa sentimental",
        type: "pie",
        radius: ["35%", "70%"],
        roseType: "area",
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          shadowBlur: 15,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
        label: {
          show: true,
          formatter: "{b}",
          color: "#fff",
          fontSize: 14,
          overflow: "truncate",
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: "#888",
          },
        },
        data: [
          { value: 14, name: "Amor", itemStyle: { color: "#FF6B57" } },
          { value: 10, name: "Magenta", itemStyle: { color: "#D855F2" } },
          { value: 13, name: "Azul oscuro", itemStyle: { color: "#3057FF" } },
          { value: 17, name: "Azul claro", itemStyle: { color: "#00CFFF" } },
          { value: 15, name: "Celeste", itemStyle: { color: "#65E4F7" } },
          { value: 10, name: "Violeta", itemStyle: { color: "#A66BFF" } },
          { value: 21, name: "Violeta oscuro", itemStyle: { color: "#7C4DFF" } },
        ],
      },
    ],
  };

  return (
    <div className="w-full flex flex-col items-center px-4">
      <h2 className="text-white text-2xl mb-6">Mapa sentimental</h2>
      <div className="w-full max-w-[900px] h-[600px]">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas", devicePixelRatio: 3 }}
        />
      </div>
      <button
        onClick={() => window.history.back()}
        className="mt-8 bg-white text-black rounded px-4 py-2 text-sm shadow-md hover:bg-gray-200 transition"
      >
        Volver
      </button>
    </div>
  );
};

export default SentimentalChart;
