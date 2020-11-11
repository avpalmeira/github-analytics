import moment from 'moment';

const getAverageActionDurationBySize = (objects) => {
  const response = [];
  response[0] = { name: 'Small', ...getAverageActionDuration(objects, "small", "MERGED") };
  response[1] = { name: 'Medium', ...getAverageActionDuration(objects, "medium", "MERGED") };
  response[2] = { name: 'Large', ...getAverageActionDuration(objects, "large", "MERGED") };
  return response;
}

// REFACTOR!
const getAverageActionDuration = (objects, size = "", state = "CLOSED") => {
  let averageDuration = 10;
  if (objects[0] && objects[0].node) {
    objects = objects.filter((obj) => obj.node.state === state);
    if (objects === []) {
      return {};
    }
    if (size === "large") {
      objects = objects.filter((obj) => (obj.node.additions + obj.node.deletions) > 1000);
    } else if (size === "medium") {
      objects = objects.filter((obj) => (obj.node.additions + obj.node.deletions) <= 1000);
    } else if (size === "small") {
      objects = objects.filter((obj) => (obj.node.additions + obj.node.deletions) <= 100);
    }

    const mapOfDurations = objects.map((obj) => {
      return (new Date(obj.node.closedAt) - new Date(obj.node.createdAt));
    });
    const sumOfDurations = mapOfDurations.reduce((total, duration) => total + duration, 0);
    averageDuration = sumOfDurations / objects.length;
  }
  const duration = moment.duration(averageDuration);
  if (size !== "") {
    return { quantity: objects.length, duration: duration.get('hours') };
  }
  return { quantity: objects.length, duration };
}

const generateActionHistoryEmpty = () => {
  const history = {};
  const end = moment();
  let current = moment().subtract(1, 'month');
  while (current.format('DD.MM') !== end.format('DD.MM')) {
    let key = current.format('DD.MM');
    history[current.format(key)] = { key, open: 0, merged: 0, closed: 0 };
    current = current.add(1, 'day');
  }
  return history;
}

const clearActionHistory = (history) => {
  const response = [];
  for (let key in history) {
    response.push(history[key]);
  }
  return response;
}

const getActionHistory = (objects) => {
  const response = generateActionHistoryEmpty();
  if (objects[0] && objects[0].node) {
    const oneMonthAgo = moment().subtract(1, 'month');
    objects.forEach((obj) => {
      let created = moment(obj.node.createdAt);
      let merged = moment(obj.node.mergedAt);
      let closed = moment(obj.node.closedAt);
      if (created.isAfter(oneMonthAgo) && response[created.format('DD.MM')]) {
        response[created.format('DD.MM')]['open']++;
      }
      if (merged && merged.isAfter(oneMonthAgo) && response[merged.format('DD.MM')]) {
        response[merged.format('DD.MM')]['merged']++;
      }
      if (closed && closed.isAfter(oneMonthAgo) && response[closed.format('DD.MM')]) {
        response[closed.format('DD.MM')]['closed']++;
      }
    });
  }
  return clearActionHistory(response);
}

const formatDayHourMinute = (duration) => {
  if (isNaN(duration.get('days'))) {
    return 'Not enough data to show results';
  }
  return `${duration.get('days')}days ${duration.get('hours')}h${duration.get('minutes')}m`;
}

export {
  formatDayHourMinute,
  getActionHistory,
  getAverageActionDurationBySize,
  getAverageActionDuration,
}
