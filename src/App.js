import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { Card, Col, Input, Layout, Row } from 'antd';
import api from './services/api';
import logo from './assets/logo.png';
import 'antd/dist/antd.css';

function App() {
  const [ issues, setIssues ] = useState([]);
  const [ pullRequests, setPullRequests ] = useState([]);
  const [ repoOwner, setRepoOwner ] = useState("");
  const [ repository, setRepository ] = useState("");

  const CustomTooltip1 = ({ active, payload, label }) => {
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

  const CustomTooltip2 = ({ active, payload, label }) => {
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

  const formatDayHourMinute = (duration) => {
    if (isNaN(duration.get('days'))) {
      return 'Not enough data to show results';
    }
    return `${duration.get('days')}days ${duration.get('hours')}h${duration.get('minutes')}m`;
  }

  // use same method as above with new params: size
  const getAverageDuration = (objects, size = "", state = "CLOSED") => {
    let averageDuration = 10;
    if (objects[0] && objects[0].node) {
      objects = objects.filter((obj) => obj.node.state === state);
      if (objects === []) {
        return {};
      }
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
    if (size !== "") {
      return { quantity: objects.length, duration: duration.get('hours') };
    }
    return { quantity: objects.length, duration };
  }


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

  const fetchRepositoryInfo = () => {

    const fetchIssues = async () => {
      const issuesQuery = `
      query IssuesClosingTime { 
        repositoryOwner(login: "${repoOwner}") {
          repository(name: "${repository}") {
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
        repositoryOwner(login: "${repoOwner}") {
          repository(name: "${repository}") {
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
    }
    fetchIssues();
    fetchPullRequests();
  }

  const { Header, Content, Sider } = Layout;
  const { Search } = Input;

  const getAveragePRDurationBySize = () => {
    const response = [];
    response[0] = { name: 'Small', ...getAverageDuration(pullRequests, "small", "MERGED") };
    response[1] = { name: 'Medium', ...getAverageDuration(pullRequests, "medium", "MERGED") };
    response[2] = { name: 'Large', ...getAverageDuration(pullRequests, "large", "MERGED") };
    return response;
  }

  return (
    <Layout className="main">
      <Sider className="sidebar">
        <img src={logo} alt="" width={60}/>
      </Sider>
      <Layout>
        <Header className="topnav">
          <Input
            value={repoOwner}
            onChange={(e) => setRepoOwner(e.target.value)}
            placeholder="Repository Owner"
            style={{ width: "50%", marginBottom: 20 }}
          />
          <Search
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            onSearch={() => fetchRepositoryInfo()}
            placeholder="Repository Name"
            enterButton
            style={{ width: "50%" }} />
        </Header>
        <Content className="content">
          <Card title="Average Merge Time by Pull Request Size">
            {getAveragePRDurationBySize()[0].duration ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart width={900} height={400} data={getAveragePRDurationBySize()}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip content={<CustomTooltip2 />} />
                <Bar dataKey="duration" fill="#8884d8"/>
              </BarChart>
            </ResponsiveContainer>
            ) : <p className="avg-time-card-text">Not enough data to show results</p>}
          </Card>
          <Row gutter={30} style={{ marginTop: 30 }}>
            <Col span={12}>
              <Card title="Average Pull Request Merge Time">
                <p className="avg-time-card-text">
                  {formatDayHourMinute(getAverageDuration(pullRequests, "", "MERGED").duration)}
                </p>
              </Card>
            </Col>
            <Col span={12}>
              <Card className="avg-time-card" title="Average Issue Close Time">
                <p className="avg-time-card-text">
                  {formatDayHourMinute(getAverageDuration(issues).duration)}
                </p>
              </Card>
            </Col>
          </Row>
          <Card title="Month Summary" style={{ marginTop: 30 }}>
            {pullRequests.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart margin={{ left: -20 }} data={clearPRHistoryKeys(pullRequestHistory(pullRequests))}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="key" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip1 />} />
                  <Line type="monotone" dataKey="open" stroke="#8884d8" />
                  <Line type="monotone" dataKey="closed" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="merged" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="avg-time-card-text">Not enough data to show results</p>}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
