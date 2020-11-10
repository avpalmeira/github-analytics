import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import moment from 'moment';
import { Card, Col, Input, Layout, Row } from 'antd';
import api from './services/api';
import logo from './assets/logo.png';
import 'antd/dist/antd.css';
import './App.css';

function App() {
  const [ issues, setIssues ] = useState([]);
  const [ pullRequests, setPullRequests ] = useState([]);
  const [ prHistory, setPRHistory ] = useState([]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload) {
      return (
        <div style={{ border: "1px solid black", padding: 10, backgroundColor: "white" }}>
          <div style={{ textAlign: "center", fontWeight: "bold" }}>Pull Requests : {label}</div>
          <div style={{ display: "flex", fontSize: 16 }}>
            <span style={{ marginRight: 10 }}>Merged</span>
            <span>{payload[0].payload.merged}</span>
          </div>
          <div style={{ display: "flex", fontSize: 16 }}>
            <span style={{ marginRight: 10 }}>Opened</span>
            <span>{payload[0].payload.open}</span>
          </div>
          <div style={{ display: "flex", fontSize: 16 }}>
            <span style={{ marginRight: 10 }}>Closed</span>
            <span>{payload[0].payload.closed}</span>
          </div>
        </div>
      );
    }
    return null;
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
    return { quantity: objects.length, duration };
  }

  useEffect(() => {

    const generatePRHistoryEmpty = () => {
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

    const pullRequestHistory = (objects) => {
      const response = generatePRHistoryEmpty();
      if (objects[0] && objects[0].node) {
        const oneMonthAgo = moment().subtract(15, 'days');
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
      return response;
    }

    const clearPRHistoryKeys = (history) => {
      const response = [];
      for (let key in history) {
        response.push(history[key]);
      }
      return response;
    }

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

      // refactor! generate array and push data
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
                  mergedAt
                  additions
                  deletions
                }
              }
            }
          }
        }
      }`;
      const res = await api.post('', { query: pullRequestsQuery });

      // refactor! generate array and push data
      const retrievedPRs = res.data.data.repositoryOwner.repository.pullRequests.edges;
      setPullRequests(retrievedPRs);
      const retrievedHistory = clearPRHistoryKeys(pullRequestHistory(retrievedPRs));
      setPRHistory(retrievedHistory);
    }
    fetchIssues();
    fetchPullRequests();
  }, []);

  const { Header, Content, Sider } = Layout;
  const { Search } = Input;

  return (
    <Layout className="main">
      <Sider className="sidebar">
        <img src={logo} alt="" width={60}/>
      </Sider>
      <Layout>
        <Header className="topnav">
          <Input placeholder="Repository Owner" style={{ width: "50%", marginBottom: 20 }} />
          <Search placeholder="Repository Name" enterButton style={{ width: "50%" }} />
        </Header>
        <Content className="content">
          <Card title="Average Merge Time by Pull Request Size">
            <p>Content</p>
          </Card>
          <Row gutter={30} style={{ marginTop: 30 }}>
            <Col span={12}>
              <Card title="Average Pull Request Merge Time">
                Time
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Average Issue Close Time">
                Time
              </Card>
            </Col>
          </Row>
          <Card title="Month Summary" style={{ marginTop: 30 }}>
            <p>Content</p>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );

  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <p>Querying data from the Github API:</p>
  //       {prHistory !== [] ? (
  //       <LineChart width={900} height={400} margin={{ left: -20 }} data={prHistory}>
  //         <Line type="monotone" dataKey="open" stroke="#8884d8" />
  //         <Line type="monotone" dataKey="closed" stroke="#82ca9d" />
  //         <Line type="monotone" dataKey="merged" stroke="#8884d8" />
  //         <XAxis dataKey="key" />
  //         <YAxis />
  //         <CartesianGrid stroke="#ccc" />
  //         <Tooltip content={<CustomTooltip />} />
  //       </LineChart>
  //       ) : null }
  //       <p>Average Duration of Closing of Issues: {formatDayHourMinute(getAverageDuration(issues).duration)}</p>
  //       <p>Average Duration of Merged PRs: {formatDayHourMinute(getAverageDuration(pullRequests, "", "MERGED").duration)}</p>
  //       <p>Average Duration of Small PRs: {formatHour(getAverageDuration(pullRequests, "small", "MERGED").duration)}</p>
  //       <p>Average Duration of Medium PRs: {formatHour(getAverageDuration(pullRequests, "medium", "MERGED").duration)}</p>
  //       <p>Average Duration of Large PRs: {formatHour(getAverageDuration(pullRequests, "large", "MERGED").duration)}</p>
  //     </header>
  //   </div>
  // );
}

export default App;
