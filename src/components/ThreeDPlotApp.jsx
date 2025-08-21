import React, { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';
import backgroundImage from '../assets/img/color-sharp.png';

//INTERFAZ Y CODIGO DE LAS GRAFICAS EN 3D

/* IMPORTANTE no manipular todo codigo relacionado a creación de gráficas */

const ThreeDPlotApp = () => {
  const [points, setPoints] = useState([]);
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [z, setZ] = useState('');
  const [textLabel, setTextLabel] = useState('');

  const [mode, setMode] = useState('markers'); 
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [angle, setAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const plotRef = useRef(null);

  const [userName, setUserName] = useState('UsuarioDemo'); // Reemplaza con el nombre del usuario real

 const pointsToCSV = (points) => {
  const header = 'x,y,z,texto\n';
  const rows = points.map(p => `${p.x},${p.y},${p.z},${p.text || ''}`).join('\n');
  return header + rows;
 };


  //DESCARGA CSV
  const handleDownloadCSV = () => {
    if (points.length === 0) {
      alert('No hay puntos para descargar');
      return;
    }

    const csv = pointsToCSV(points);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'grafica.csv';
    a.click();

    URL.revokeObjectURL(url); // Liberar memoria
  };


  const handleSaveCSV = async () => {
    if (points.length === 0) {
      alert('No hay puntos para guardar');
      return;
    }

    const csv = pointsToCSV(points);
    const blob = new Blob([csv], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('archivo', blob, 'grafica.csv');
    formData.append('nombre', userName);

    try {
      console.log("Enviando CSV al backend...");
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Token no encontrado. ¿Has iniciado sesión?");
      }
//BUG por no conectar bien autenticación de usuarios/ google / BDD
      const response = await fetch('http://localhost:5000/api/graficas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Gráfica guardada correctamente');
      } else {
        const error = await response.text();
        alert('Error guardando gráfica: ' + error);
      }
    } catch (error) {
      console.error("Error de red: ", error);
      alert('Error de red: ' + error.message);
    }
  };

  //FRONT DEL DEMO GRAFICA GUARDADA
  const [graficas, setGraficas] = useState([]);

  useEffect(() => {
    const fetchGraficas = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/graficas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setGraficas(data);
    };

    fetchGraficas();
  }, []);

  //valida a usuarios existentes de la bdd
  const descargarGrafica = (nombreArchivo) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/graficas/descargar/${nombreArchivo}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(data => {
      setGraficas(prev => [...prev, data.archivo]);
    })
    .then(res => {
      if (!res.ok) throw new Error('Error al descargar');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => alert('Error al descargar: ' + err.message));
  };

  const eliminarGrafica = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/graficas/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setGraficas((prev) => prev.filter((g) => g.id !== id));
    } else {
      alert('Error al eliminar la gráfica');
    }
  };



  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setAngle(prev => {
        const nextAngle = prev + 0.02;
        const camera = {
          eye: {
            x: 1.5 * Math.cos(nextAngle),
            y: 1.5 * Math.sin(nextAngle),
            z: 0.8,
          },
        };
        if (plotRef.current) {
          const plotElement = plotRef.current.el;
          if (plotElement) {
            window.Plotly.relayout(plotElement, { 'scene.camera': camera });
          }
        }
        return nextAngle;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  const handleAddOrUpdatePoint = () => {
  const newPoint = { 
    x: parseFloat(x), 
    y: parseFloat(y), 
    z: parseFloat(z), 
    text: textLabel 
  };
  if (isNaN(newPoint.x) || isNaN(newPoint.y) || isNaN(newPoint.z)) return;

  if (editingIndex !== null) {
    const updated = [...points];
    updated[editingIndex] = newPoint;
    setPoints(updated);
    setEditingIndex(null);
  } else {
    setPoints([...points, newPoint]);
  }
  setX(''); setY(''); setZ(''); setTextLabel('');
};


  const handleDelete = index => {
    const updated = points.filter((_, i) => i !== index);
    setPoints(updated);
    setSelectedIndex(null);
  };

  const handleEdit = index => {
  const point = points[index];
  setX(point.x);
  setY(point.y);
  setZ(point.z);
  setTextLabel(point.text || '');
  setEditingIndex(index);
};


  const handleResetGraph = () => {
    setPoints([]);
    setX('');
    setY('');
    setZ('');
    setEditingIndex(null);
    setSelectedIndex(null);
  };

  const handleFileUpload = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const text = evt.target.result;
    const lines = text.trim().split('\n');
    const hasHeader = lines[0].toLowerCase().includes('x') && lines[0].toLowerCase().includes('y');
    const dataLines = hasHeader ? lines.slice(1) : lines;
    const newPoints = dataLines.map(line => {
      const [x, y, z, label] = line.split(',').map(val => val.trim());
      return { 
        x: parseFloat(x), 
        y: parseFloat(y), 
        z: parseFloat(z), 
        text: label || '' 
      };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.z));
    setPoints(newPoints);
    setSelectedIndex(null);
    setEditingIndex(null);
  };
  reader.readAsText(file);
};

 let data;
if (mode === 'surface') {
  // código de cuadrícula regular para superficie ya existente
   if (points.length === 0) {
      data = [];
    } else {
      const N = Math.round(Math.sqrt(points.length));
      if (N * N !== points.length) {
        data = [];
      } else {
        const zMatrix = [];
        for (let i = 0; i < N; i++) {
          zMatrix.push(points.slice(i * N, i * N + N).map(p => p.z));
        }
        const xVals = [...new Set(points.map(p => p.x))].sort((a,b) => a-b);
        const yVals = [...new Set(points.map(p => p.y))].sort((a,b) => a-b);
        data = [{
          type: 'surface',
          x: xVals,
          y: yVals,
          z: zMatrix,
          hoverinfo: 'text+x+y+z',
          colorscale: 'Viridis',
        }];
      }
    }
} else if (mode === 'mesh3d') {
  data = [{
    type: 'mesh3d',
    x: points.map(p => p.x),
    y: points.map(p => p.y),
    z: points.map(p => p.z),
    text: points.map(p => p.text || ''),
    hoverinfo: 'text+x+y+z',
    opacity: 0.7,
    color: 'blue'
  }];
} else {
  data = [{
    x: points.map(p => p.x),
    y: points.map(p => p.y),
    z: points.map(p => p.z),
    text: points.map(p => p.text || ''),
    hoverinfo: 'text+x+y+z',
    type: 'scatter3d',
    mode,
    marker: {
      size: 5,
      color: points.map(p => p.z),
      colorscale: 'Viridis',
      colorbar: { title: 'Altura (Z)' },
    },
    line: {
      color: 'blue',
      width: mode.includes('lines') ? 2 : 0,
    },
  }];
}



//codigo sucio, separar estilos
  const btnStyle = {
    padding: '6px 12px',
    marginRight: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
  };

  const btnDangerStyle = {
    ...btnStyle,
    backgroundColor: '#dc3545',
  };

  return (
    <div 
      style={{
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        color: 'white',
      }}
    >
      {/* HEADER */}
      <header 
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <h1 style={{ margin: 0 }}>Puedes guardar o descargar tus gráficas</h1>
        <button onClick={handleDownloadCSV} style={{ ...btnStyle, backgroundColor: '#641434' }}>Descargar CSV</button>
        <button onClick={handleSaveCSV} style={{ ...btnStyle, backgroundColor: '#641434' }}>Guardar gráfica</button>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '15px 20px',
          gap: '20px',
          maxWidth: '1200px',
          margin: 'auto',
          width: '100%',
        }}
      >
        {/* Inputs y Controles */}
        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            padding: '10px',
          }}
        >
          <input
  type="text"
  placeholder="Texto (opcional)"
  value={textLabel}
  onChange={e => setTextLabel(e.target.value)}
  style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '120px' }}
 />

          <input
            type="number"
            placeholder="X"
            value={x}
            onChange={e => setX(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '70px' }}
          />
          <input
            type="number"
            placeholder="Y"
            value={y}
            onChange={e => setY(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '70px' }}
          />
          <input
            type="number"
            placeholder="Z"
            value={z}
            onChange={e => setZ(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: 'none', width: '70px' }}
          />
          <button onClick={handleAddOrUpdatePoint} style={{ ...btnStyle, backgroundColor: '#641434' }}>
            {editingIndex !== null ? 'Actualizar punto' : 'Agregar punto'}
          </button>
          <button onClick={handleResetGraph} style={{ ...btnStyle, backgroundColor: '#641434' }}>
            Limpiar gráfica
          </button>

         <select
  value={mode}
  onChange={e => setMode(e.target.value)}
  style={{ padding: '6px', borderRadius: '4px', border: 'none' }}
>
  <option value="markers">Solo Puntos</option>
  <option value="lines">Solo Líneas</option>
  <option value="lines+markers">Puntos y Líneas</option>
  <option value="surface">Superficie (recomendado cuadrículas)</option>
  <option value="mesh3d">Malla automática (para puntos dispersos)</option> {/* IMportante no manipular todo codigo relacionado a creación de gráficas */}
</select>


          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={e => setAutoRotate(e.target.checked)}
            />
            Rotación Automática
          </label>
          <input type="file" accept=".csv" onChange={handleFileUpload} style={{ color: 'white' }} />
        </section>

        {/* Lista de puntos */}
        <section
          style={{
            maxHeight: '150px',
            overflowY: 'auto',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            padding: '10px',
            color: 'white',
            fontSize: '14px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Lista de puntos</h3>
          {points.length === 0 ? (
            <p>No hay puntos agregados.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {points.map((p, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    backgroundColor: selectedIndex === i ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                  onClick={() => setSelectedIndex(i)}
                >
                  <span>
        <span>
  ({p.x.toFixed(2)}, {p.y.toFixed(2)}, {p.z.toFixed(2)}) {p.text ? `- ${p.text}` : ''}
</span>

                  </span>
                  <span>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(i); }} style={{ ...btnStyle , backgroundColor: '#641434',padding: '2px 6px', fontSize: '12px' }}>Editar</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(i); }} style={{ ...btnDangerStyle, backgroundColor: '#641434', padding: '2px 6px', fontSize: '12px', marginLeft: '5px' }}>Eliminar</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Plot 3D */}
        <section
          style={{
            flexGrow: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            padding: '10px',
          }}
        >
          <Plot
            ref={plotRef}
            data={data}
            layout={{
              width: '100%',
              height: 500,
              margin: { l: 40, r: 40, b: 40, t: 40 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              scene: {
                xaxis: { title: 'X' },
                yaxis: { title: 'Y' },
                zaxis: { title: 'Z' },
                camera: {
                  eye: {
                    x: 1.5 * Math.cos(angle),
                    y: 1.5 * Math.sin(angle),
                    z: 0.8,
                  },
                },
              },
              font: { color: 'white' },
            }}
            config={{ responsive: true }}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
          />
        </section>

        {/* Gráficas guardadas */}
        <section
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '8px',
            padding: '10px',
          }}
        >
          <h3>Gráficas guardadas</h3>
          {graficas.length === 0 ? (
            <p>No hay gráficas guardadas.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {graficas.map(g => (
                <li
                  key={g.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 0',
                    alignItems: 'center',
                  }}
                >
                  <span>{g.nombreArchivo}</span>
                  <span>
                    <button onClick={() => descargarGrafica(g.nombreArchivo)} style={{ ...btnStyle, backgroundColor: '#641434' }}>Descargar</button>
                    <button onClick={() => eliminarGrafica(g.id)} style={{ ...btnStyle, backgroundColor: '#641434' }}>Eliminar</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '14px',
        }}
      >
       
      </footer>
    </div>
  );
};

export default ThreeDPlotApp;
