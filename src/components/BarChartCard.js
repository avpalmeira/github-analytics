import React from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
} from 'antd';

const BarChartCard = (props) => {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload) {
      return (
        <div style={{ border: "1px solid black", padding: 10, backgroundColor: "white" }}>
          <div style={{ textAlign: "center", fontWeight: "bold" }}>{label}</div>
          <div style={{ display: "flex", fontSize: 16 }}>
            <span style={{ marginRight: 10 }}>Average Time</span>
            <span>{payload[0].payload.duration}h</span>
          </div>
          <div style={{ display: "flex", fontSize: 16 }}>
            <span style={{ marginRight: 10 }}>Pull Requests</span>
            <span>{payload[0].payload.quantity}</span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <Card title={props.title}>
      {props.data[0].duration ? (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart width={900} height={400} data={props.data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name"/>
          <YAxis/>
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="duration" fill="#8884d8"/>
        </BarChart>
      </ResponsiveContainer>
      ) : <p className="avg-time-card-text">Not enough data to show results</p>}
    </Card>
  );
}

export default BarChartCard;