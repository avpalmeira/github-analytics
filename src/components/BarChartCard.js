import React from 'react';
import PropTypes from 'prop-types';
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
        <div className="tooltip">
          <div className="tooltip-label">{label}</div>
          <div className="tooltip-text">
            <span>Average Time</span>
            <span>{payload[0].payload.duration}h</span>
          </div>
          <div className="tooltip-text">
            <span>Pull Requests</span>
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

BarChartCard.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
};

export default BarChartCard;
