import React from "react";
import ReactECharts from "echarts-for-react";

const SentimentalChart = () => {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}%",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "75%"],
        roseType: "area",
        itemStyle: {
          borderRadius: 8,
          shadowBlur: 25,
          shadowColor: "rgba(0, 0, 0, 0.4)",
        },
        label: {
          color: "#fff",
          fontSize: 16,
          overflow: "break",
        },
        labelLine: {
          length: 15,
          length2: 20,
          smooth: true,
          lineStyle: {
            color: "#aaa",
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
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        height: "600px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: "2rem" }}>
        Mapa sentimental
      </h2>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "canvas", devicePixelRatio: 3 }}
      />
      <button
        onClick={() => window.history.back()}
        style={{
          marginTop: "2rem",
          background: "#fff",
          color: "#000",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          cursor: "pointer",
        }}
      >
        Volver
      </button>
    </div>
  );
};

export default SentimentalChart;
