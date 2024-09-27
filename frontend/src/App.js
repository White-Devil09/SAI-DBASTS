// myproject/frontend/myapp/src/App.js
import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then((response) => response.json())
      .then((data) => setMessage(data.message));
  }, []);

  return <div>{message}</div>;
}

export default App;