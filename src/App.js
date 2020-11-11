import React, { useState } from 'react';
import moment from 'moment';
import {
  Col,
  Input,
  Layout,
  Row,
} from 'antd';
import api from './services/api';
import {
  AverageDurationCard,
  BarChartCard,
  LineChartCard,
} from './components';
import logo from './assets/logo.png';
import 'antd/dist/antd.css';

function App() {
  const [ issues, setIssues ] = useState([]);
  const [ pullRequests, setPullRequests ] = useState([]);
  const [ repoOwner, setRepoOwner ] = useState("");
  const [ repository, setRepository ] = useState("");

  const { Header, Content, Sider } = Layout;
  const { Search } = Input;

  const getAveragePRDurationBySize = () => {
    const response = [];
    response[0] = { name: 'Small', ...getAverageDuration(pullRequests, "small", "MERGED") };
    response[1] = { name: 'Medium', ...getAverageDuration(pullRequests, "medium", "MERGED") };
    response[2] = { name: 'Large', ...getAverageDuration(pullRequests, "large", "MERGED") };
    return response;
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
          <BarChartCard
            title="Average Merge Time by Pull Request Size"
            data={getAveragePRDurationBySize()}
          />
          <Row gutter={30} style={{ marginTop: 30 }}>
            <Col span={12}>
              <AverageDurationCard
                title="Average Pull Request Merge Time"
                duration={getAverageDuration(pullRequests, "", "MERGED").duration}
              />
            </Col>
            <Col span={12}>
              <AverageDurationCard
                title="Average Issue Close Time"
                duration={getAverageDuration(issues).duration}
              />
            </Col>
          </Row>
          <LineChartCard
            title="Month Summary"
            originData={pullRequests}
            data={clearPRHistoryKeys(pullRequestHistory(pullRequests))}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
