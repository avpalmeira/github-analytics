import axios from 'axios';

const githubApiUrl = process.env.REACT_APP_GITHUB_API_URL;
const accessToken = process.env.REACT_APP_GITHUB_ACCESS_TOKEN;
const api = axios.create({
  baseURL: githubApiUrl,
  headers: { authorization: `Bearer ${accessToken}` }
});

export default api;
