import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { MeasurementProvider } from './context/MeasurementContext.jsx';
import { PoseProvider } from './context/PoseContext.jsx';
import { CostumeProvider } from './context/CostumeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MeasurementProvider>
        <PoseProvider>
          <CostumeProvider>
            <App />
          </CostumeProvider>
        </PoseProvider>
      </MeasurementProvider>
    </BrowserRouter>
  </React.StrictMode>
);
