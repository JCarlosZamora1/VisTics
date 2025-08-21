import DashboardNavBar from '../components/DashBoardNavBar';
import { Footer } from '../components/Footer';
import React from 'react';
import ThreeDPlotApp from '../components/ThreeDPlotApp';

//Conecta a Perfilesjsx
function GrafPage() {
  return (
    <>
      <DashboardNavBar />
      <div className="grafpage-container">
        <h1 className="grafpage-title">VisTics</h1>
        <ThreeDPlotApp />
      </div>
      <Footer showMailchimp={false} />
    </>
  );
}

export default GrafPage;
