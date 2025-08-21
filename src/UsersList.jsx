import React, { useEffect, useState } from "react";

export const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//llamada al back para enlistar usuarios, requerimiento suspendido/no aplicado

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error al obtener usuarios");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h3>Usuarios registrados</h3>
      {users.length === 0 && <p>No hay usuarios registrados aún.</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <b>Nombre:</b> {user.nombre} | <b>Usuario:</b> {user.usuario} | <b>Email:</b> {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
