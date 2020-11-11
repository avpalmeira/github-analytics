import api from './api';

const fetchIssues = async (repoOwner, repository) => {
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

  // refactor! generate array, validate fields and push data
  const retrievedIssues = res.data.data.repositoryOwner.repository.issues.edges;

  return retrievedIssues;
}

export default fetchIssues;
