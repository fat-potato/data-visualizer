import { useState, useEffect } from "react";
import BarChart from "../components/BarChart";
// import { UserData } from "./Data";

import { getMostPopular } from "../api/index";

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "The most popular products requested",
    },
  },
};

function MostPopularProduct({ defaultData }) {
  const [chartData, setChartData] = useState(defaultData);

  useEffect(() => {
    getMostPopular().then((res) => {
      setChartData({
        labels: res.map((item) => item.groupName),
        datasets: [
          {
            label: "Samples requested in product group",
            data: res.map((item) => item.count),
            backgroundColor: "rgba(53, 162, 235, 0.5)",
            borderColor: "black",
            borderWidth: 2,
          },
        ],
      });
    });
  }, []);

  return (
    <div style={{ width: 700 }}>
      <BarChart options={options} chartData={chartData} />
    </div>
  );
}

export default MostPopularProduct;
