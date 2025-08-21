import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getBotHistory } from "../services/api.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Graph = () => {
  const [labels, setLabels] = useState([]);
  const [dataPoints, setDataPoints] = useState([]);

  const fetchData = async () => {
    const res = await getBotHistory();
    const history = res.data;
    setLabels(history.map((h) => new Date(h.createdAt).toLocaleTimeString()));
    setDataPoints(history.map((h) => (h.choice === "UP" ? 1 : 0)));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // live update every 3s
    return () => clearInterval(interval);
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Bot Predictions",
        data: dataPoints,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1
      }
    ]
  };

  return <Line data={data} />;
};

export default Graph;
