import DashboardNavBar from '../components/DashBoardNavBar';
import { Footer } from '../components/Footer';
import React from 'react';
import Perfiles from '../components/Perfiles';
//conecta a 3DPLOT
function GrafPage() {
  return (
    <>
      <DashboardNavBar />
      <div className="grafpage-container">
        <h1 className="grafpage-title">VisTics</h1>
        <Perfiles />
      </div>
      <Footer showMailchimp={false} />
    </>
  );
}

export default GrafPage;
