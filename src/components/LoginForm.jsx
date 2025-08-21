// LoginForm.jsx
function LoginForm({ setIsLoggedIn, setUserRole }) {
  const [usuario, setUsuario] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
      } else {
        localStorage.setItem('token', data.token);
localStorage.setItem('nombre', data.usuario.nombre); 
localStorage.setItem('usuario', data.usuario.usuario); 

setUserRole(data.usuario.esAdmin ? 'admin' : 'user');
setIsLoggedIn(true);
setError('');

      }
    } catch {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Inputs para usuario y password */}
      {/* Botón y mostrar error */}
    </form>
  );
}
