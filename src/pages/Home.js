import { NavBar } from "../components/NavBar";
import { Banner } from "../components/Banner";
import { AcercaDe, Skills } from "../components/Skills";
import { Projects } from "../components/Projects";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";



import { Link } from "react-router-dom";




function Home() {
  return (
   
   
    <div className="App">
      <NavBar />
      <Banner />
      <AcercaDe />
       <Projects />
      <Contact />
    <Footer showMailchimp={true} />

    </div>
  );
}

export default Home;
