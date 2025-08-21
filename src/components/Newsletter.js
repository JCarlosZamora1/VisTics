import { useState, useEffect } from "react";
import { Col, Row, Alert } from "react-bootstrap";
import RegistroForm from './RegistroForm';


//Correspondencia: Requerimento suspendido / pausado
//Act: Queda pendiente implementar autorización por OUAUTH GOOGLE
/*
BUG: como está a medias el registro por google:
usuario registrado con google: no puede graficar 3D
usuario existente: puede graficar todo mientras no sea de google
*/
export const Newsletter = ({ status, message, onValidated }) => {
  const [email, setEmail] = useState('');
  const [mostrarRegistroForm, setMostrarRegistroForm] = useState(false);

  useEffect(() => {
    if (status === 'success') clearFields();
  }, [status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMostrarRegistroForm(true); 
  };

  const clearFields = () => {
    setEmail('');
  };

  return (
    <Col lg={12}>
      <div className="newsletter-bx wow slideInUp">
        <Row>
          <Col lg={12} md={6} xl={5}>
            <h3>También puedes registrarte como usuario<br /></h3>
            {status === 'enviando' && <Alert>Enviando...</Alert>}
            {status === 'error' && <Alert variant="danger">{message}</Alert>}
            {status === 'success' && <Alert variant="success">{message}</Alert>}
          </Col>
          <Col md={6} xl={7}>
            <form onSubmit={handleSubmit}>
              <div className="new-email-bx">
                <input
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Correo electrónico"
                  required
                />
                <button type="submit">Registrar</button>
              </div>
            </form>
          </Col>
        </Row>

        {/* Mostrar el formulario solo si se ha hecho clic en Registrar */}
        {mostrarRegistroForm && (
          <div style={{ marginTop: '2rem' }}>
            <RegistroForm />
          </div>
        )}
      </div>
    </Col>
  );
};
