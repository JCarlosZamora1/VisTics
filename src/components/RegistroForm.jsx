import React, { useState } from "react";

const RegistroForm = () => {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !usuario || !email || !password || !confirmPassword) {
      setMensaje("Por favor llena todos los campos");
      return;
    }
    if (password !== confirmPassword) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    const data = { nombre, usuario, email, password };

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

const result = await response.json();
console.log("Resultado del registro:", result);
console.log("Status HTTP:", response.status);


      if (response.ok) {
        setMensaje("Usuario registrado correctamente");
        setNombre("");
        setUsuario("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMensaje("Error: " + (result.error || "Errorz en el registro"));
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Registro de Usuario</h3>
      {mensaje && (
        <p style={{ color: mensaje.startsWith("Error") ? "red" : "green", marginBottom: "1rem" }}>
          {mensaje}
        </p>
      )}

      <input
        style={inputStyle}
        type="text"
        placeholder="Nombre completo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <input
        style={inputStyle}
        type="text"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        required
      />

      <input
        style={inputStyle}
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        style={inputStyle}
        type={showPassword ? "text" : "password"}
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        style={inputStyle}
        type={showPassword ? "text" : "password"}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <label style={{ display: "block", marginBottom: "1rem", fontSize: "0.9rem" }}>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
          style={{ marginRight: "0.5rem" }}
        />
        Mostrar contraseñas
      </label>

      <button type="submit" className="vvd" style={{ width: "100%" }}>
        Registrar
      </button>
      

    </form>
  );
};

// Estilo simple para inputs 
const inputStyle = {
  width: "100%",
  padding: "0.7rem",
  marginBottom: "1rem",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  boxSizing: "border-box",
};

export default RegistroForm;
