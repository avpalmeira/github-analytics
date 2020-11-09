import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const githubApiUrl = process.env.REACT_APP_GITHUB_API_URL;
  const accessToken = process.env.REACT_APP_GITHUB_ACCESS_TOKEN;
  const api = axios.create({
    baseURL: githubApiUrl,
    headers: { authorization: `Bearer ${accessToken}` }
  });

  const [ login, setLogin ] = useState("");

  useEffect(() => {
    const fetchViewerLogin = async () => {
      const response = await api.post('/', { query: "query { viewer { login } }" });
      setLogin(response.data.data.viewer.login);
    }
    fetchViewerLogin();
  });

  return (
    <div className="App">
      <header className="App-header">
        <p>Querying data from the Github API:</p>
        <p>Username - {login}</p>
      </header>
    </div>
  );
}

export default App;
