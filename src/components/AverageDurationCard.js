import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import { formatDayHourMinute } from '../helpers/dateTimeHelper';

const AverageDuration = (props) => {
  return (
    <Card title={props.title}>
      <p className="avg-time-card-text">
        {formatDayHourMinute(props.duration)}
      </p>
    </Card>
  );
}

AverageDuration.propTypes = {
  title: PropTypes.string,
  duration: PropTypes.object,
};

export default AverageDuration;
