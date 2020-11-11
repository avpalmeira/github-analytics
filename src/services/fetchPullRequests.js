import api from './api';

const fetchPullRequests = async (repoOwner, repository) => {
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

  // refactor! generate array, validate fields and push data
  const retrievedPRs = res.data.data.repositoryOwner.repository.pullRequests.edges;
  return retrievedPRs;
}

export default fetchPullRequests;
