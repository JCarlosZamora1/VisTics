import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home"; // Crearemos este archivo en el paso siguiente
//import GrafPage from "./pages/GrafPage";
import GrafPage from "./pages/GrafPage";
import './App.css'
import React, {useEffect} from 'react';
import ThreeDPlotApp from "./components/ThreeDPlotApp";

//
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import Login from './components/Login';  // Ajusta la ruta según donde lo creaste
import { useState } from 'react';
import RegistroForm from "./components/RegistroForm"; // Asegúrate de que la ruta sea correcta
import PerfPage from "./pages/PerfPage";

function App() {
  
  return (
  <div>
   
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegistroForm />} />
<Route path="/PerfPage" element={<PerfPage />} />
        <Route path="/grafica" element={<GrafPage />} />
      </Routes>
    </Router>
  </div>
  );
}

export default App;
