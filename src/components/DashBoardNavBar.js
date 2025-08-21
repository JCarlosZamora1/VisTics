// DashboardNavBar.js
import { Navbar, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import logo from "../assets/img/LOGO.png";


const DashboardNavBar = () => {
  return (
    <Navbar expand="md" className="scrolled">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Logo" />
        </Navbar.Brand>
        <span className="navbar-text">
          <Link to="/">
            <button className="vvd"><span>Inicio</span></button>
          </Link>
        </span>
      </Container>
    </Navbar>
  );
};

export default DashboardNavBar;
