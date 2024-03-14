import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import './App.css';
import LoginPage from "./pages/LoginPage";
import ExplorerPage from "./pages/ExplorerPage";

function App() {
  return (
      <div className="App">
        <BrowserRouter>
            <Routes>
                <Route path="" element={<ExplorerPage/>}/>
                <Route path="auth" element={<LoginPage/>}/>
            </Routes>
        </BrowserRouter>
      </div>
  );
}

export default App;
