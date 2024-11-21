import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import LoginRegister from "./components/LoginRegister";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginRegister />} />
            </Routes>
        </Router>
    );
}

export default App;
