import { useState, useEffect } from "react";
import { Navbar, Nav, Container, Modal, Button, Form } from "react-bootstrap";
import logo from '../assets/img/LOGO.png';
import navIcon1 from '../assets/img/llama.png';
import navIcon2 from '../assets/img/nav-icon2.svg';
import navIcon3 from '../assets/img/nav-icon3.svg';
import { useLocation } from 'react-router-dom';

export const NavBar = () => {
  const [activeLink, setActiveLink] = useState('Inicio');
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState(localStorage.getItem('nombre') || '');
  const [profileImage, setProfileImage] = useState(null);

  const location = useLocation();

  useEffect(() => {
  const nombreLS = localStorage.getItem('nombre');
  if (isLoggedIn && nombreLS && nombreLS !== nombre) {
    setNombre(nombreLS);
  }
}, [isLoggedIn, nombre]);

  useEffect(() => {
  // Captura el token desde la URL si viene de Google
  const params = new URLSearchParams(window.location.search);
  const tokenFromGoogle = params.get('token');

  if (tokenFromGoogle) {
    localStorage.setItem('token', tokenFromGoogle);

    // Obtener nombre desde el backend
    fetch('http://localhost:5000/api/perfil', {
      headers: {
        Authorization: `Bearer ${tokenFromGoogle}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setIsLoggedIn(true);
      setNombre(data.nombre);
      localStorage.setItem('nombre', data.nombre);

      const savedImage = localStorage.getItem(`profileImage_${data.nombre}`);
      if (savedImage) setProfileImage(savedImage);
      else setProfileImage(null);
    });

    // Limpiar la URL (quita ?token=...)
    window.history.replaceState({}, '', '/');
  } else {
    // Si ya hay token en localStorage, usarlo
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);

    const nombreGuardado = localStorage.getItem('nombre');
    if (nombreGuardado) {
      setNombre(nombreGuardado);
      const image = localStorage.getItem(`profileImage_${nombreGuardado}`);
      if (image) setProfileImage(image);
      else setProfileImage(null);
    }
  }

  const onScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    // No borrar foto para conservarla
    setIsLoggedIn(false);
    setNombre('');
    setProfileImage(null);
  };

  const handleProfileImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result;
          const nombreGuardado = localStorage.getItem('nombre');
          if (nombreGuardado) {
            localStorage.setItem(`profileImage_${nombreGuardado}`, base64);
            setProfileImage(base64);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };
const onUpdateActiveLink = (value) => {
  setActiveLink(value);
};

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('nombre', data.nombre);
      setNombre(data.nombre);
      setIsLoggedIn(true);
      setShowLogin(false);
    } else {
      alert(data.message || 'Login fallido');
    }
  } catch (err) {
    console.error(err);
    alert('Error al iniciar sesión');
  }
};

  return (
    <>
      <Navbar expand="md" className={scrolled ? "scrolled" : ""}>
        <Container>
          <Navbar.Brand href="/">
            <img src={logo} alt="Logo" />
          </Navbar.Brand>

          {isLoggedIn && (
            <div className="d-flex align-items-center gap-2">
              <h2 className="mb-0">Bienvenido {usuario}!</h2>

              <div
                onClick={handleProfileImageClick}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  border: '2px solid #ccc',
                  backgroundColor: '#eee',
                  display: 'inline-block',
                }}
                title="Cambiar foto de perfil"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: '#666',
                    }}
                  >
                    +
                  </div>
                )}
              </div>
            </div>
          )}

          <Navbar.Toggle aria-controls="basic-navbar-nav">
            <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#Inicio" className={activeLink === 'Inicio' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('Inicio')}>Inicio</Nav.Link>
              <Nav.Link href="#Acerca De" className={activeLink === 'Acerca De' ? 'active navbar-link' : 'navbar-link'} onClick={() => onUpdateActiveLink('Acerca De')}>Acerca De</Nav.Link>
            </Nav>
            <span className="navbar-text">
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

              {!isLoggedIn ? (
                <>
                  {/* Botón para abrir modal login manual */}
                  <button className="vvd me-2" onClick={() => setShowLogin(true)}>
                    <span>Iniciar Sesión</span>
                  </button>

                  {/* Botón login con Google */}
                  <button
                    className="vvd google-btn"
                    onClick={() => {
                      window.location.href = 'http://localhost:5000/api/auth/google';
                    }}
                  >
                    <span>Iniciar sesión con Google</span>
                  </button>
                </>
              ) : (
                <button className="vvd" onClick={handleLogout}>
                  <span>Cerrar sesión</span>
                </button>
              )}
            </span>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Modal Login Manual */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formUsuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="vvd w-100">
              Ingresar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
