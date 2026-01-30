import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreatePaste from './components/CreatePaste';
import ViewPaste from './components/ViewPaste';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CreatePaste />} />
          <Route path="/p/:id" element={<ViewPaste />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
