import React, { useState } from 'react';
import {
  Col,
  Input,
  Layout,
  Row,
} from 'antd';
import {
  fetchIssues,
  fetchPullRequests,
} from './services';
import {
  AverageDurationCard,
  BarChartCard,
  LineChartCard,
} from './components';
import {
  getAverageActionDurationBySize,
  getAverageActionDuration,
  getActionHistory,
} from './helpers';
import logo from './assets/logo.png';
import 'antd/dist/antd.css';

function App() {
  const [ issues, setIssues ] = useState([]);
  const [ pullRequests, setPullRequests ] = useState([]);

  const [ repoOwner, setRepoOwner ] = useState("");
  const [ repository, setRepository ] = useState("");

  const { Header, Content, Sider } = Layout;
  const { Search } = Input;

  const fetchRepositoryInfo = async () => {
    const retrievedIssues = await fetchIssues(repoOwner, repository);
    const retrievedPullRequests = await fetchPullRequests(repoOwner, repository);
    setIssues(retrievedIssues);
    setPullRequests(retrievedPullRequests);
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
            className="input top-input"
          />
          <Search
            value={repository}
            onChange={(e) => setRepository(e.target.value)}
            onSearch={() => fetchRepositoryInfo()}
            placeholder="Repository Name"
            enterButton
            className="input"
          />
        </Header>
        <Content className="content">
          <BarChartCard
            title="Average Merge Time by Pull Request Size"
            data={getAverageActionDurationBySize(pullRequests)}
          />
          <Row gutter={30} style={{ marginTop: 30 }}>
            <Col span={12}>
              <AverageDurationCard
                title="Average Pull Request Merge Time"
                duration={getAverageActionDuration(pullRequests, "", "MERGED").duration}
              />
            </Col>
            <Col span={12}>
              <AverageDurationCard
                title="Average Issue Close Time"
                duration={getAverageActionDuration(issues).duration}
              />
            </Col>
          </Row>
          <LineChartCard
            title="Month Summary"
            originData={pullRequests}
            data={getActionHistory(pullRequests)}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
