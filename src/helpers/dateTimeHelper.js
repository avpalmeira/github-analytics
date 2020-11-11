const formatDayHourMinute = (duration) => {
  if (isNaN(duration.get('days'))) {
    return 'Not enough data to show results';
  }
  return `${duration.get('days')}days ${duration.get('hours')}h${duration.get('minutes')}m`;
}

export {
  formatDayHourMinute
}
