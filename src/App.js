import React, { useState, useEffect } from 'react';
import moment from 'moment';
import api from './services/api';
import './App.css';

function App() {
  const [ issues, setIssues ] = useState([]);
  const [ pullRequests, setPullRequests ] = useState([]);

  const formatDayHourMinute = (duration) => {
    return `${duration.get('days')}days ${duration.get('hours')}h${duration.get('minutes')}m`;
  }

  const formatHour = (duration) => {
    return `${duration.get('hours')}h`;
  }

  // use same method as above with new params: size
  const getAverageDuration = (objects, size = "") => {
    let averageDuration = 10;
    if (objects[0] && objects[0].node) {
      if (size === "large") {
        objects = objects.filter((obj) => obj.node.additions + obj.node.deletions > 1000);
      } else if (size === "medium") {
        objects = objects.filter((obj) => obj.node.additions + obj.node.deletions <= 1000);
      } else if (size === "small") {
        objects = objects.filter((obj) => obj.node.additions + obj.node.deletions <= 100);
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
            issues(last: 100, states: CLOSED) {
              totalCount
              edges {
                node {
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
            pullRequests(last: 100, states: CLOSED) {
              totalCount
              edges {
                node {
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
        <p>Average Duration of Closing of Issues: {formatDayHourMinute(getAverageDuration(issues))}</p>
        <p>Average Duration of Merged PRs: {formatDayHourMinute(getAverageDuration(pullRequests))}</p>
        <p>Average Duration of Small PRs: {formatHour(getAverageDuration(pullRequests, "small"))}</p>
        <p>Average Duration of Medium PRs: {formatHour(getAverageDuration(pullRequests, "medium"))}</p>
        <p>Average Duration of Large PRs: {formatHour(getAverageDuration(pullRequests, "large"))}</p>
      </header>
    </div>
  );
}

export default App;
