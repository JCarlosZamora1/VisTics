import { Container, Row, Col, Tab, Nav } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";


//Apartado de Evaluacion de materias

export const Projects = () => {
  const navigate = useNavigate();

  const [materia, setMateria] = useState("");
  const [ejeX, setEjeX] = useState(10);
  const [ejeY, setEjeY] = useState(10);
  const [ejeZ, setEjeZ] = useState(10);
  const [materias, setMaterias] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const opciones = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

  const significados = {
    10: "ESCASO-NULO",
    20: "EXISTENTE-SOMERO",
    30: "LIMITADO",
    40: "SUFICIENTE",
    50: "REGULAR",
    60: "TEMARIO AMPLIO",
    70: "TEMARIO EXTENSO Y RELEVANTE",
    80: "PRIORITARIO",
    90: "INTEGRO Y PROFUNDO",
    100: "TOTALITARIO"
  };

  const resetCampos = () => {
    setMateria("");
    setEjeX(10);
    setEjeY(10);
    setEjeZ(10);
    setEditIndex(null);
  };

  const agregarOModificarMateria = () => {
    if (!materia) return alert("Debes ingresar un nombre de materia");

    const valores = [
      { eje: "Eje X", valor: ejeX },
      { eje: "Eje Y", valor: ejeY },
      { eje: "Eje Z", valor: ejeZ }
    ];
    const mayor = valores.reduce((a, b) => (a.valor >= b.valor ? a : b)).eje;

    const nuevaMateria = { materia, ejeX, ejeY, ejeZ, mayor };

    if (editIndex !== null) {
      const actualizadas = [...materias];
      actualizadas[editIndex] = nuevaMateria;
      setMaterias(actualizadas);
    } else {
      setMaterias([...materias, nuevaMateria]);
    }
    resetCampos();
  };

  const editarMateria = (index) => {
    const m = materias[index];
    setMateria(m.materia);
    setEjeX(m.ejeX);
    setEjeY(m.ejeY);
    setEjeZ(m.ejeZ);
    setEditIndex(index);
  };

  const limpiarTodo = () => {
    if (window.confirm("¿Seguro que deseas borrar todos los datos?")) {
      setMaterias([]);
      resetCampos();
    }
  };

  const calcularEjeMasUsado = () => {
    const conteo = { "Eje X": 0, "Eje Y": 0, "Eje Z": 0 };
    materias.forEach(m => {
      conteo[m.mayor] = (conteo[m.mayor] || 0) + 1;
    });
    const mayor = Object.entries(conteo).reduce((a, b) => (a[1] >= b[1] ? a : b));
    return mayor[0];
  };

  const generarCSV = () => {
    let csv = "Materia,Eje de Conocimientos (X),Eje de Habilidades (Y),Eje de Disposiciones (Z),Eje con mayor calificación\n";
    materias.forEach(m => {
      csv += `${m.materia},${m.ejeX},${m.ejeY},${m.ejeZ},${m.mayor}\n`;
    });
    csv += `\nEsta carrera se inclina más al: ${calcularEjeMasUsado()}\n`;
    descargarArchivo(csv, "evaluacion_materias.csv");
  };

  const generarExcel = () => {
    const data = materias.map(m => ({
      Materia: m.materia,
      "Eje de Conocimientos (X)": m.ejeX,
      "Eje de Habilidades (Y)": m.ejeY,
      "Eje de Disposiciones (Z)": m.ejeZ,
      "Eje con mayor calificación": m.mayor
    }));

    data.push({}, { Materia: "Esta carrera se inclina más a:", "Eje X": calcularEjeMasUsado() });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Evaluación");

    XLSX.writeFile(wb, "evaluacion_materias.xlsx");
  };

  const generarArchivoParaGraficar = () => {
    let csv = "x,y,z,materia\n";
    materias.forEach(m => {
      csv += `${m.ejeX},${m.ejeY},${m.ejeZ},${m.materia}\n`;
    });
    descargarArchivo(csv, "archivo_para_graficar.csv");
  };

  const descargarArchivo = (contenido, nombreArchivo) => {
    const blob = new Blob([contenido], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    a.click();
  };

  //Colores y estilo (separar para codigo más limpio)
  return (
    <div className="container">
      <style>{`
        body {
          background-color: #121212;
          color: #f0f0f0;
          font-family: 'Segoe UI', sans-serif;
        }
        .container {
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }
        h2, h3 {
          color: #f0f0f0;
        }
        input, select, button, a {
          font-size: 1rem;
        }
        input, select {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          background-color: #1e1e1e;
          color: #f0f0f0;
          border: 1px solid #641434;
          border-radius: 5px;
        }
        select option {
          background-color: #1e1e1e;
          color: #f0f0f0;
        }
        .button {
          padding: 10px 16px;
          margin: 5px 5px 5px 0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #641434;
          color: #fff;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #8b1d51;
        }
        .danger {
          background-color: #a4161a;
        }
        .danger:hover {
          background-color: #d7263d;
        }
        .success {
          background-color: #15803d;
        }
        .success:hover {
          background-color: #22c55e;
        }
        .secondary {
          background-color: #3b82f6;
        }
        .secondary:hover {
          background-color: #60a5fa;
        }
        .list-item {
          border-bottom: 1px solid #333;
          padding: 8px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .link {
          color: #61dafb;
          text-decoration: underline;
          cursor: pointer;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .small {
          font-size: 0.9rem;
          color: #aaa;
        }
      `}</style>



      <div>
        <h3>Evalúa tu plan de estudios para poder graficar:</h3>
        <a href="/rubrica.pdf" target="_blank" rel="noopener noreferrer" className="link">Ver rúbrica</a> |{" "}
        <a href="/rubrica.pdf" download="rubrica_evaluacion.pdf" className="link">Descargar rúbrica</a>
      <p>Si ya tienes un archivo de excel o csv ya puedes ir directo a graficar!</p>
      </div>

      <h2>Evaluación de materias</h2>

      <input
        type="text"
        placeholder="Nombre de materia"
        value={materia}
        onChange={(e) => setMateria(e.target.value)}
      />

      <div className="grid">
        <div>
          <label>Eje X:</label>
          <select value={ejeX} onChange={(e) => setEjeX(Number(e.target.value))}>
            {opciones.map((num) => <option key={num} value={num}>{num}</option>)}
          </select>
          <p className="small">{significados[ejeX]}</p>
        </div>

        <div>
          <label>Eje Y:</label>
          <select value={ejeY} onChange={(e) => setEjeY(Number(e.target.value))}>
            {opciones.map((num) => <option key={num} value={num}>{num}</option>)}
          </select>
          <p className="small">{significados[ejeY]}</p>
        </div>

        <div>
          <label>Eje Z:</label>
          <select value={ejeZ} onChange={(e) => setEjeZ(Number(e.target.value))}>
            {opciones.map((num) => <option key={num} value={num}>{num}</option>)}
          </select>
          <p className="small">{significados[ejeZ]}</p>
        </div>
      </div>

      <button onClick={agregarOModificarMateria} className={`button ${editIndex !== null ? 'secondary' : ''}`}>
        {editIndex !== null ? "Guardar cambios" : "Agregar materia"}
      </button>
      <button onClick={limpiarTodo} className="button danger">Limpiar todo</button>

      {materias.length > 0 && (
        <>
          <h3>Materias ingresadas:</h3>
          <ul>
            {materias.map((m, i) => (
              <li key={i} className="list-item">
                <div>{m.materia} → X: {m.ejeX}, Y: {m.ejeY}, Z: {m.ejeZ} → Mayor: {m.mayor}</div>
                <span className="link" onClick={() => editarMateria(i)}>Editar</span>
              </li>
            ))}
          </ul>

          <div className="grid" style={{ marginTop: "1rem" }}>
            <button onClick={generarCSV} className="button success">Exportar CSV completo</button>
            <button onClick={generarExcel} className="button success">Exportar Excel (.xlsx)</button>
            <button onClick={generarArchivoParaGraficar} className="button">Generar archivo para graficar</button>
          </div>
        </>
      )}
    </div>
  );
};
