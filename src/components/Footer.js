import { Container, Row, Col } from "react-bootstrap";
import { MailchimpForm } from "./MailchimpForm";
import logo from "../assets/img/LOGO.png";
import navIcon1 from "../assets/img/llama.png";
import navIcon2 from "../assets/img/nav-icon2.svg";
import navIcon3 from "../assets/img/nav-icon3.svg";

export const Footer = ({ showMailchimp = true }) => {
  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center">
          {showMailchimp && <MailchimpForm />}
          <Col size={12} sm={6}>
            <img src={logo} alt="Logo" />
          </Col>
          <Col size={12} sm={6} className="text-center text-sm-end">
            <div className="social-icon">
  <a href="https://www.morelia.tecnm.mx/#/" target="_blank" rel="noopener noreferrer">
    <img src={navIcon1} alt="ITM" />
  </a>
  <a href="https://www.facebook.com/TecNMITMorelia" target="_blank" rel="noopener noreferrer">
    <img src={navIcon2} alt="Facebook" />
  </a>
  <a href="mailto:comunicacion@morelia.tecnm.mx">
    <img src={navIcon3} alt="Correo" />
  </a>
</div>

            <p>VisTics 2025 </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

