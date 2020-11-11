import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
} from 'antd';

const LineChartCard = (props) => {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload) {
      return (
        <div className="tooltip">
          <div className="tooltip-label">Pull Requests : {label}</div>
          <div className="tooltip-text">
            <span>Merged</span>
            <span>{payload[0].payload.merged}</span>
          </div>
          <div className="tooltip-text">
            <span>Opened</span>
            <span>{payload[0].payload.open}</span>
          </div>
          <div className="tooltip-text">
            <span>Closed</span>
            <span>{payload[0].payload.closed}</span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <Card title={props.title} style={{ marginTop: 30 }}>
      {props.originData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart margin={{ left: -20 }} data={props.data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="key" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="open" stroke="#8884d8" />
            <Line type="monotone" dataKey="closed" stroke="#82ca9d" />
            <Line type="monotone" dataKey="merged" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      ) : <p className="avg-time-card-text">Not enough data to show results</p>}
    </Card>
  );
}

LineChartCard.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  originData: PropTypes.object,
};

export default LineChartCard;
