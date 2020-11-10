import React, { useState, useEffect, Fragment } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import moment from 'moment';
import api from './services/api';
import './App.css';

function App() {
  const [ issues, setIssues ] = useState([]);
  const [ pullRequests, setPullRequests ] = useState([]);

  const CustomTooltip = ({ active, payload }) => {
    if (active) {
      return (
        <div style={{ border: "1px solid black", padding: 10, backgroundColor: "white" }}>
          <div style={{ display: "flex", fontSize: 16 }}>
            <span style={{ marginRight: 10 }}>Average Time</span>
            <span>{payload[0].value}</span>
          </div>
          <div style={{ display: "flex", fontSize: 16 }}>
            <span style={{ marginRight: 10 }}>Pull Requests</span>
            <span>{payload[0].payload.prs}</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const issuesData = () => {
    const data = [
      {
        name: "A",
        issues: 20,
        prs: 4
      },
      {
        name: "B",
        issues: 31,
        prs: 6
      },
      {
        name: "C",
        issues: 12,
        prs: 5
      },
      {
        name: "D",
        issues: 29,
        prs: 9
      },
    ];
    return data;
  }

  const pullRequestsData = () => {
    const data = [];
    return data;
  }

  const formatDayHourMinute = (duration) => {
    return `${duration.get('days')}days ${duration.get('hours')}h${duration.get('minutes')}m`;
  }

  const formatHour = (duration) => {
    return `${duration.get('hours')}h`;
  }

  // use same method as above with new params: size
  const getAverageDuration = (objects, size = "", state = "CLOSED") => {
    let averageDuration = 10;
    if (objects[0] && objects[0].node) {
      objects = objects.filter((obj) => obj.node.state === state);
      if (size === "large") {
        objects = objects.filter((obj) => {
          return obj.node.additions + obj.node.deletions > 1000
        });
      } else if (size === "medium") {
        objects = objects.filter((obj) => {
          return obj.node.additions + obj.node.deletions <= 1000
        });
      } else if (size === "small") {
        objects = objects.filter((obj) => {
          return obj.node.additions + obj.node.deletions <= 100
        });
      }
      const mapOfDurations = objects.map((obj) => {
        return (new Date(obj.node.closedAt) - new Date(obj.node.createdAt));
      });
      const sumOfDurations = mapOfDurations.reduce((total, duration) => total + duration, 0);
      averageDuration = sumOfDurations / objects.length;
    }
    const duration = moment.duration(averageDuration);
    return duration;
  }

  useEffect(() => {
    const fetchIssues = async () => {
      const issuesQuery = `
      query IssuesClosingTime { 
        repositoryOwner(login: "google") {
          repository(name: "web-stories-wp") {
            issues(last: 100) {
              totalCount
              edges {
                node {
                  state
                  createdAt
                  closedAt
                }
              }
            }
          }
        }
      }`;
      const res = await api.post('', { query: issuesQuery });

      // refactor!
      const retrievedIssues = res.data.data.repositoryOwner.repository.issues.edges;
      setIssues(retrievedIssues);
    }
    const fetchPullRequests = async () => {
      const pullRequestsQuery = `
      query IssuesClosingTime { 
        repositoryOwner(login: "google") {
          repository(name: "web-stories-wp") {
            pullRequests(last: 100) {
              totalCount
              edges {
                node {
                  state
                  createdAt
                  closedAt
                  additions
                  deletions
                }
              }
            }
          }
        }
      }`;
      const res = await api.post('', { query: pullRequestsQuery });

      // refactor!
      const retrievedPRs = res.data.data.repositoryOwner.repository.pullRequests.edges;
      setPullRequests(retrievedPRs);
    }
    fetchIssues();
    fetchPullRequests();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Querying data from the Github API:</p>
        <p>Number of issues: {issues.length}</p>
        <LineChart width={600} height={400} margin={{ left: -20 }} data={issuesData()}>
          <Line type="monotone" dataKey="issues" stroke="#888" />
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
        </LineChart>
        {/* <p>Average Duration of Closing of Issues: {formatDayHourMinute(getAverageDuration(issues))}</p> */}
        {/* <p>Average Duration of Merged PRs: {formatDayHourMinute(getAverageDuration(pullRequests, "", "MERGED"))}</p> */}
        {/* <p>Average Duration of Small PRs: {formatHour(getAverageDuration(pullRequests, "small", "MERGED"))}</p> */}
        {/* <p>Average Duration of Medium PRs: {formatHour(getAverageDuration(pullRequests, "medium", "MERGED"))}</p> */}
        {/* <p>Average Duration of Large PRs: {formatHour(getAverageDuration(pullRequests, "large", "MERGED"))}</p> */}
      </header>
    </div>
  );
}

export default App;
