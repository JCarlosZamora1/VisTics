import { useEffect, useState } from 'react';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');


  //conectaba a lista admin de usuarios, requerimiento pausado/suspendido no implementado
  useEffect(() => {
    const fetchUsuarios = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No autorizado');
        return;
      }

      try {
        const res = await fetch('http://10.0.2.2:5000/api/users', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUsuarios(data);
        } else {
          setError('Error al obtener usuarios');
        }
      } catch {
        setError('Error al conectar con el servidor');
      }
    };

    fetchUsuarios();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Usuarios registrados</h2>
      <ul>
        {usuarios.map(u => (
          <li key={u.id}>{u.nombre} ({u.usuario}) - {u.email}</li>
        ))}
      </ul>
    </div>
  );
};
