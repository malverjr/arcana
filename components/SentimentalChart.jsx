import React from "react";
import ReactECharts from "echarts-for-react";

const SentimentalChart = () => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'  
    },
    toolbox: {
      show: false
    },
    series: [
      {
        name: 'Mapa sentimental',
        type: 'pie',
        radius: [20, 100],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.4)'
        },
        label: {
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold'
        },
        data: [
          { value: 14, name: 'Amor' },
          { value: 10, name: 'Magenta' },
          { value: 13, name: 'Azul oscuro' },
          { value: 17, name: 'Azul claro' },
          { value: 15, name: 'Celeste' },
          { value: 10, name: 'Violeta' },
          { value: 21, name: 'Violeta oscuro' }
        ]
      }
    ]
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h2 className="text-white text-2xl mb-4">Mapa sentimental</h2>
      <div className="w-full max-w-[400px]">
        <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
      </div>
      <button
        onClick={() => window.history.back()}
        className="mt-6 bg-white text-black rounded px-4 py-2 text-sm"
      >
        Volver
      </button>
    </div>
  );
};

export default SentimentalChart;
