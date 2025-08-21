import React, { useState } from 'react';
import Papa from 'papaparse';
import Plot from 'react-plotly.js';

//JS PAUSADO IRSE EN LUGAR AL JS DE THREEDPLOT
const CSV3DPlot = () => {
  const [points, setPoints] = useState([]);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError('El archivo está vacío o no tiene datos válidos.');
          setPoints([]);
          return;
        }

        // Validar que existan las columnas x, y, z
        const firstRow = results.data[0];
        if (!('x' in firstRow) || !('y' in firstRow) || !('z' in firstRow)) {
          setError('El archivo CSV debe contener columnas llamadas "x", "y" y "z".');
          setPoints([]);
          return;
        }

        // Extraer solo puntos válidos
        const parsedPoints = results.data
          .map(({ x, y, z }) => ({ x, y, z }))
          .filter(p => typeof p.x === 'number' && typeof p.y === 'number' && typeof p.z === 'number');

        if (parsedPoints.length === 0) {
          setError('No se encontraron datos numéricos válidos en las columnas "x", "y" y "z".');
          setPoints([]);
          return;
        }

        setPoints(parsedPoints);
      },
      error: (err) => {
        setError(`Error al leer el archivo: ${err.message}`);
        setPoints([]);
      }
    });
  };

  return (
    <div className="container my-4">
      <h2>Cargar CSV para gráfico 3D</h2>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileUpload}
        className="form-control mb-3"
      />
      {error && <div className="alert alert-danger">{error}</div>}

      {points.length > 0 && (
        <Plot
          data={[
            {
              x: points.map(p => p.x),
              y: points.map(p => p.y),
              z: points.map(p => p.z),
              mode: 'markers',
              type: 'scatter3d',
              marker: { size: 4, color: 'green' },
            },
          ]}
          layout={{ title: 'Gráfico 3D desde CSV', autosize: true, height: 600 }}
          config={{ responsive: true }}
          style={{ width: '100%' }}
        />
      )}
    </div>
  );
};

export default CSV3DPlot;
