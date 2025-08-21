import React, { useState } from "react";
import Papa from "papaparse";
import { useEffect } from "react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { pdf } from "@react-pdf/renderer";
import { Image } from "@react-pdf/renderer";



const Perfiles = () => {

  useEffect(() => {
  const saved = localStorage.getItem("points");
  if (saved) {
    try {
      setPoints(JSON.parse(saved));
    } catch (err) {
      console.error("Error al cargar puntos:", err);
    }
  }
}, []);



  const [points, setPoints] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, label: "" });

const [editingPoint, setEditingPoint] = useState(null); // Punto que se está editando


  const ellipses = [
    { cx: 45, cy: 50, rx: 35, ry: 46, rotation: -20, color: "#ff6666", label: "Security" },
    { cx: 60, cy: 38, rx: 20, ry: 39, rotation: 30, color: "#66cc66", label: "Software" },
    { cx: 22, cy: 32, rx: 20, ry: 30, rotation: 0, color: "#6699cc", label: "Hardware" },
    { cx: 45, cy: 45, rx: 25, ry: 25, rotation: 0, color: "#ffcc66", label: "IT Platforms" },
    { cx: 79, cy: 58, rx: 29, ry: 39, rotation: 0, color: "#cc66cc", label: "Digital Transformation and Intelligence" },
  ];

  const scale = (value) => 60 + (value / 100) * 480;
const isPointInEllipseNoRotation = (x, y, ellipse) => {
  const dx = x - ellipse.cx;
  const dy = y - ellipse.cy;
  const term1 = (dx ** 2) / (ellipse.rx ** 2);
  const term2 = (dy ** 2) / (ellipse.ry ** 2);
  return term1 + term2 <= 1;
};
// Nueva versión de isPointInEllipse, que asume coordenadas escaladas y sistema SVG (Y hacia abajo)
const isPointInEllipse = (x, y, ellipse) => {
  const rad = (Math.PI / 180) * ellipse.rotation;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Calcula dx y dy respecto al centro escalado y con Y invertida
  const dx = x - scale(ellipse.cx);
  const dy = y - scale(100 - ellipse.cy);

  const term1 = ((dx * cos + dy * sin) ** 2) / ((ellipse.rx / 100 * 480) ** 2);
  const term2 = ((dx * sin - dy * cos) ** 2) / ((ellipse.ry / 100 * 480) ** 2);
  return term1 + term2 <= 1;
};

// Modifica getEllipsesForPoint para que pase las coordenadas escaladas y con Y invertida

const getEllipsesForPoint = (point) => {
  const scaledX = scale(point.x);
  const scaledY = scale(100 - point.y);
  return ellipses.filter(e => isPointInEllipse(scaledX, scaledY, e));
};






const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "csv") {
    // Procesar CSV
    Papa.parse(file, {
      complete: (results) => processData(results.data),
    });
  } else if (extension === "xlsx" || extension === "xls") {
    // Procesar Excel
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }); // array de arrays
      processData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("Formato no soportado. Sube un archivo CSV o Excel.");
  }
};
const processData = (data) => {
  const parsed = data
    .filter(row => row.length >= 4)
    .map((row, index) => {
      let px, py, pz, label;

      // Detección automática de formato
      if (typeof row[0] === "string" && isNaN(row[0])) {
        // Formato label, x, y, z
        label = row[0];
        px = parseFloat(row[1]);
        py = parseFloat(row[2]);
        pz = parseFloat(row[3]);
      } else {
        // Formato x, y, z, label
        px = parseFloat(row[0]);
        py = parseFloat(row[1]);
        pz = parseFloat(row[2]);
        label = String(row[3]);
      }

      const overlapping = getEllipsesForPoint({ x: px, y: py });
      const colors = overlapping.map(e => e.color);

      return {
        id: index,
        x: px,
        y: py,
        z: pz,
        label: label.trim(),
        colors,
      };
    });

  setPoints(parsed);
};


 // Función para verificar que un punto esté exactamente en las áreas exclusivas indicadas
const isPointInExclusiveAreas = (point, exclusiveAreas) => {
  // Normaliza etiquetas
  const normalize = str => str.trim().toLowerCase();

  // Áreas en las que cae el punto
  const pointAreas = getEllipsesForPoint(point)
    .map(a => normalize(a.label))
    .sort();

  // Áreas esperadas
  const expectedAreas = exclusiveAreas.map(normalize).sort();

  // Comparación estricta de conjuntos}
  if (pointAreas.length !== expectedAreas.length) return false;
  return expectedAreas.every(area => pointAreas.includes(area));
};

// Contador de puntos para perfiles
const countPointsExclusive = (points, exclusiveAreas) =>
  points.filter(point => isPointInExclusiveAreas(point, exclusiveAreas)).length;

// Perfiles
const countCSEC = countPointsExclusive(points, ["security"]);
const countCE   = countPointsExclusive(points, ["hardware", "security"]);
const countSE   = countPointsExclusive(points, ["security", "software", "it platforms"]);
const countIDS = countPointsExclusive(points, ["digital transformation and intelligence"]);
const countIT = countPointsExclusive(points, ["security", "software", "it platforms","digital transformation and intelligence"]);
const countCS = countPointsExclusive(points, ["security", "software"]);

// Guardar todos los conteos con su nombre
const perfiles = [
  { nombre: "CSEC", puntos: countCSEC },
  { nombre: "CE",   puntos: countCE },
  { nombre: "IT",   puntos: countIT },
  { nombre: "IS & DS",   puntos: countIDS },
  { nombre: "CS",   puntos: countCS },
  { nombre: "SE",   puntos: countSE }
];

// Encontrar el perfil con más puntos
const perfilMasPuntos = perfiles.reduce((max, actual) =>
  actual.puntos > max.puntos ? actual : max
);

// Solo mostrar si hay puntos > 0
const perfilDetectado = perfilMasPuntos.puntos > 0 ? perfilMasPuntos.nombre : null;



const areas = ["security", "hardware", "software", "it platforms","digital transformation and intelligence"];
let maxArea = null;
let maxCount = 0;
for (const area of areas) {
  const c = countPointsExclusive(points, [area]);
  if (c > maxCount) {
    maxArea = area;
    maxCount = c;
  }
}

const areaColor = maxArea
  ? ellipses.find(e => e.label.toLowerCase() === maxArea)?.color
  : "#ccc";


const handleExportPDF = async () => {
  const imgData = await captureChart();  // <-- aquí lo obtienes
  const blob = await pdf(<MyDocument chartImage={imgData} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte.pdf";
  a.click();
  URL.revokeObjectURL(url);
};




const [chartImage, setChartImage] = useState(null);

const captureChart = async () => {
  const element = document.getElementById("grafica-solo");
  const canvas = await html2canvas(element, { backgroundColor: "#111", useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  // opcional: si quieres guardarlo en estado para otra cosa:
  // setChartImage(imgData);
  return imgData;
};




// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
     padding: 30,
    fontSize: 12,
    lineHeight: 1.5,
    backgroundColor: '#E4E4E4'
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold"
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold"
  },
 
  listItem: {
    marginLeft: 15,
    marginBottom: 3
  },
  chart: {
    marginTop: 20,
    alignSelf: "center",
    width: 500,
    height: 450
  },
  profileHeader: {
    marginTop: 10,
    fontWeight: "bold"
  },
  textBlock: {
    marginBottom: 10
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});


//Propiedades del pdf a generar
const MyDocument = ({ chartImage }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>REPORTE DE PERFIL</Text>
         <Text style={styles.subtitle}>ESTE GRAFICO CORRESPONDE AL PERFIL DE: {perfilMasPuntos.nombre} </Text>
         
         <Text style={styles.textblock}>
          Perfil con más puntos: {perfilMasPuntos.nombre} ({perfilMasPuntos.puntos} puntos)
        </Text>
        <Text style={styles.textblock}>Área con más puntos: {maxArea}</Text>
       
    <View>
  <Text style={styles.textblock}>Detalle de todos los perfiles:</Text>
  {perfiles.map((p) => (
    <Text key={p.nombre} style={styles.listItem} >
      • {p.nombre}: {p.puntos} punto{p.puntos !== 1 ? "s" : ""}
    </Text>
  ))}
</View>


        {chartImage && (
          <Image 
            src={chartImage}             
            style={styles.chart}
          />
        )}

        
        <Text style={styles.textblock}>
          {"\n"} 
          {"\n"}
           {"\n"}
            {"\n"}
          ¿QUÉ SIGNIFICA CADA PERFIL? {"\n"}
          Computer Engineering (CE) {"\n"}
Ser estudiante de Computer Engineering significa formarse en un perfil híbrido que combina ingeniería electrónica e informática. Se estudia cómo funcionan los circuitos, los microprocesadores y los sistemas digitales, al mismo tiempo que se aprenden algoritmos, programación y desarrollo de software. Es un camino ideal para quienes disfrutan tanto del hardware como del software, pues se enfoca en diseñar y optimizar dispositivos tecnológicos, sistemas embebidos, redes de sensores y hasta componentes para la inteligencia artificial.
{"\n"}
{"\n"}
Computer Science (CS){"\n"}
Un estudiante de Computer Science se sumerge en la base teórica y lógica que sostiene la computación moderna. Se estudian algoritmos, matemáticas discretas, estructuras de datos, teoría de lenguajes y áreas como la inteligencia artificial o la computación cuántica. Significa prepararse para ser capaz de resolver problemas complejos desde una perspectiva fundamental, desarrollando nuevos métodos computacionales y expandiendo los límites de la tecnología.
{"\n"}
{"\n"}
Cybersecurity (CSEC){"\n"}
Ser estudiante de Cybersecurity implica adentrarse en la defensa de la información y de los sistemas digitales. Este perfil forma a quienes serán responsables de la protección contra ciberataques, el análisis forense digital, el diseño de redes seguras y la aplicación de técnicas de criptografía. Significa aprender a pensar como un atacante para anticiparse a las amenazas, pero con la ética de resguardar la integridad, la privacidad y la seguridad de las organizaciones y de las personas.
{"\n"}
{"\n"}
Information Systems (IS){"\n"}
Un estudiante de Information Systems se prepara para ser un puente entre la tecnología y los negocios. Este perfil se centra en el diseño, gestión y optimización de sistemas que apoyan la toma de decisiones en empresas e instituciones. Significa aprender a analizar procesos, entender necesidades organizacionales y proponer soluciones tecnológicas que generen valor estratégico, con un enfoque menos técnico en programación profunda y más orientado a la gestión y uso de la información.
{"\n"}
{"\n"}
Information Technology (IT){"\n"}
Ser estudiante de Information Technology significa enfocarse en la implementación, administración y soporte de la infraestructura tecnológica. Este perfil forma a quienes garantizarán que redes, servidores, sistemas operativos, servicios en la nube y bases de datos funcionen correctamente. Es un camino práctico y aplicado, donde se aprende a resolver problemas técnicos de manera eficiente y a mantener operativos los entornos tecnológicos en los que descansan tanto empresas como usuarios.
{"\n"}
{"\n"}
Data Science (DS){"\n"}
Un estudiante de Data Science se convierte en un explorador de datos. Este perfil combina matemáticas, estadística, programación y aprendizaje automático para transformar grandes volúmenes de información en conocimiento útil. Significa aprender a analizar patrones, desarrollar modelos predictivos y diseñar visualizaciones claras que respalden decisiones estratégicas. Es un perfil clave en la era digital, donde los datos se han convertido en uno de los recursos más valiosos para ciencia, negocios y tecnología.
{"\n"}
{"\n"}
Software Engineering (SE){"\n"}
Ser estudiante de Software Engineering implica especializarse en el desarrollo y mantenimiento de software a gran escala. Este perfil abarca desde aprender lenguajes de programación y arquitecturas de software, hasta aplicar metodologías ágiles y técnicas de aseguramiento de calidad. Significa prepararse para crear aplicaciones robustas, seguras y escalables que respondan a necesidades reales, con una visión profesional que combina lo técnico con la gestión de proyectos.
    {"\n"}      
           </Text>
      </View>
    </Page>
  </Document>
);
//por falta de tiempo se dejó asi de sencillo el pdf (tan asi como para usar todos esos "\n" :/)


  return (

         <div id="grafica-container">
    <div style={{ textAlign: "center", position: "relative" }}>
      <h2>Plano de Perfiles Estudiantiles</h2>
    <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />


{/* Área con más puntos */}
{maxArea && (
  <div
    style={{
      fontWeight: "bold",
      marginTop: "10px",
      fontSize: "16px",
      color: areaColor, // color del área ganadora
    }}
  >
    Área con más puntos: {maxArea}
  </div>
)}




{perfilDetectado && (
  <div style={{ color: "white", fontWeight: "bold", marginTop: "10px" }}>
    Perfil con más puntos: {perfilDetectado}
    <ul style={{ color: "#ccc", fontWeight: "normal", marginTop: 8, listStyleType: "none", paddingLeft: 0 }}>
      {perfiles.map((p) => (
        <li key={p.nombre}>
          {p.nombre}: {p.puntos} punto{p.puntos !== 1 ? "s" : ""}
        </li>
      ))}
    </ul>
  </div>
)}



<button
  style={{
    marginTop: 10,
    marginLeft: 10,
    backgroundColor: "#333",
    color: "#fff",
    padding: "6px 12px",
    border: "1px solid #555",
    cursor: "pointer",
    borderRadius: 4,
  }}
  onClick={() => {
    const element = document.getElementById("grafica-solo"); // solo la grafica para hacer la imagen
    html2canvas(element, { backgroundColor: "#111" }).then((canvas) => {
      const a = document.createElement("a");
      a.download = "grafica.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    });
  }}
>
  Exportar como PNG
</button>

<button
  style={{
    marginTop: 10,
    marginLeft: 10,
    backgroundColor: "#333",
    color: "#fff",
    padding: "6px 12px",
    border: "1px solid #555",
    cursor: "pointer",
    borderRadius: 4,
  }}
  onClick={handleExportPDF}
>
  Exportar como PDF
</button>




<div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
  {ellipses.map((e, i) => (
    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 16, height: 16, backgroundColor: e.color, border: "1px solid #ccc" }} />
      <span style={{ color: "#ccc", fontSize: 14 }}>{e.label}</span>
    </div>
  ))}
</div>

<div id="grafica-solo">
  <svg
    width={600}
    height={600}
    viewBox="-110 0 700 600"
    style={{ border: "1px solid #444", backgroundColor: "#111", marginTop: 20 }}
  >

    
        {/* Lista de puntos para editar */}
{points.length > 0 && (
  <div style={{ marginTop: 30 }}>
    <h3 style={{ color: "#ccc" }}>Puntos cargados</h3>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {points.map((p, i) => (
        <li key={p.id} style={{ color: "#ccc", marginBottom: 6 }}>
          #{i + 1} — {p.label} (X: {p.x}, Y: {p.y}, Z: {p.z}){" "}
          <button
            onClick={() => setEditingPoint({ ...p, index: i })}
            style={{
              marginLeft: 10,
              backgroundColor: "#444",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            Editar
          </button>
        </li>
      ))}
    </ul>
  </div>
)}



        {/* Definir colroes combinados */}
        <defs>
          {points.map((point) =>
            point.colors.length > 1 ? (
              <radialGradient
                key={`grad-${point.id}`}
                id={`grad-${point.id}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                {point.colors.map((color, i) => (
                  <stop
                    key={i}
                    offset={`${(i / (point.colors.length - 1)) * 100}%`}
                    stopColor={color}
                  />
                ))}
              </radialGradient>
            ) : null
          )}
        </defs>

        {/* Ejes */}
        <line x1={50} y1={550} x2={550} y2={550} stroke="#777" />
        <line x1={50} y1={50} x2={50} y2={550} stroke="#777" />
        {[...Array(11)].map((_, i) => (
          <g key={i}>
            <text x={50 + i * 50} y={565} fill="#aaa" fontSize={10} textAnchor="middle">
              {i * 10}
            </text>
            <text x={35} y={550 - i * 50} fill="#aaa" fontSize={10} textAnchor="end" dominantBaseline="middle">
              {i * 10}
            </text>

        {/*Textos de la grafica */}
        <text x={50} y={75} fill="#888" fontSize={12} textAnchor="end">
  Dominio de la computación
</text>

<text
    x={50} 
    y={280}               
    fill="#888" fontSize={12} textAnchor="end"
  >
    Tecnologías de
    Computación
  </text>

<text
    x={50} 
    y={480}               
    fill="#888" fontSize={12} textAnchor="end"
  >
    Fundamentos Computación
  </text>

           <text
    x={150} 
    y={585}               
    fill="#888" fontSize={12} textAnchor="end"
  >
    Hardware
  </text>
           <text
    x={300} 
    y={585}               
  fill="#888" fontSize={12} textAnchor="end"
  >
    Software
  </text>
            <text
    x={550} 
    y={585}               
    fill="#888" fontSize={12} textAnchor="end"
  >
    Necesidades Organizacionales
  </text>

  
            
            <line x1={50 + i * 50} y1={545} x2={50 + i * 50} y2={555} stroke="#aaa" />
            <line x1={45} y1={550 - i * 50} x2={55} y2={550 - i * 50} stroke="#aaa" />
          </g>
        ))}




        {/* Elipses */}
        {ellipses.map((e, i) => (
          <g key={i} transform={`rotate(${e.rotation}, ${scale(e.cx)}, ${scale(100 - e.cy)})`}>
            <ellipse
              cx={scale(e.cx)}
              cy={scale(100 - e.cy)}
              rx={(e.rx / 100) * 500}
              ry={(e.ry / 100) * 500}
              fill={e.color}
              fillOpacity={0.3}
              stroke={e.color}
              strokeWidth={2}
            />
            <text
              x={scale(e.cx)}
              y={scale(100 - e.cy) - (e.ry / 100) * 500 - 10}
              fill={e.color}
              fontWeight="bold"
              fontSize={16}
              textAnchor="middle"
            >
              {e.label}
            </text>
          </g>
        ))}

        {/* Puntos */}
        {points.map((p, i) => {
          const cx = scale(p.x);
          const cy = scale(100 - p.y);
          const fill =
            p.colors.length > 1
              ? `url(#grad-${p.id})`
              : p.colors[0] || "#999999";

          return (
            <g
              key={i}
              onMouseEnter={(ev) => {
  const rect = ev.currentTarget.getBoundingClientRect();

  // Buscar todos los puntos con mismas coordenadas para mostrarlos en el tooltip
  const samePoints = points.filter(
    (pt) => pt.x === p.x && pt.y === p.y
  );

  setTooltip({
    visible: true,
    x: rect.x + rect.width / 2,
    y: rect.y,
    points: samePoints.map(sp => ({
      label: sp.label,
      xVal: sp.x,
      yVal: sp.y,
      zVal: sp.z,
      areas: getEllipsesForPoint(sp).map(e => e.label)
    }))
  });
}}


              onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, label: "" })}
            >
              <circle
                cx={cx}
                cy={cy}
                r={6}
                fill={fill}
                stroke="#000"
                strokeWidth={1}
              />
            </g>
          );
        })}
      </svg>
  </div>

</div>




      {/* Tooltip */}
 {tooltip.visible && (
  <div style={{
    position: "fixed",
    left: tooltip.x + 10,
    top: tooltip.y - 30,
    backgroundColor: "#222",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: 4,
    pointerEvents: "none",
    fontWeight: "bold",
    fontSize: 14,
    whiteSpace: "nowrap",
    userSelect: "none",
    zIndex: 1000,
  }}>
    {tooltip.points.map((pt, idx) => (
      <div key={idx} style={{ marginBottom: 4 }}>
        <strong>{pt.label}</strong>
        <div style={{ fontSize: 12 }}>
          X: {pt.xVal}, Y: {pt.yVal}, Z: {pt.zVal}
        </div>
        <div style={{ fontSize: 12 }}>
          Áreas: {pt.areas.length > 0 ? pt.areas.join(", ") : "Computación"}
        </div>
      </div>
    ))}
  </div>
)}

      {/* Lista de puntos para editar */}
{points.length > 0 && (
  <div style={{ marginTop: 30 }}>
    <h3 style={{ color: "#ccc" }}>Puntos cargados</h3>
    <ul style={{ listStyle: "none", padding: 0 }}>
      {points.map((p, i) => (
        <li key={p.id} style={{ color: "#ccc", marginBottom: 6 }}>
          #{i + 1} — {p.label} (X: {p.x}, Y: {p.y}, Z: {p.z}){" "}
          <button
            onClick={() => setEditingPoint({ ...p, index: i })}
            style={{
              marginLeft: 10,
              backgroundColor: " #8b1d51",
              color: "#fff",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
              borderRadius: 4,
            }}
          >
            Editar
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
{/* Modal de edición de punto */}
{editingPoint !== null && (
  <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#222",
      color: "#fff",
      padding: "20px",
      borderRadius: "8px",
      zIndex: 1001,
      boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    }}
  >
    <h3>Editar punto</h3>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label>
        X:
        <input
          type="number"
          value={editingPoint.x}
          onChange={(e) =>
            setEditingPoint({ ...editingPoint, x: parseFloat(e.target.value) })
          }
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          value={editingPoint.y}
          onChange={(e) =>
            setEditingPoint({ ...editingPoint, y: parseFloat(e.target.value) })
          }
        />
      </label>
      <label>
        Z:
        <input
          type="number"
          value={editingPoint.z}
          onChange={(e) =>
            setEditingPoint({ ...editingPoint, z: parseFloat(e.target.value) })
          }
        />
      </label>
      <label>
        Etiqueta:
        <input
          type="text"
          value={editingPoint.label}
          onChange={(e) =>
            setEditingPoint({ ...editingPoint, label: e.target.value })
          }
        />
      </label>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <button
          onClick={() => {
            const updated = [...points];
            const overlapping = getEllipsesForPoint({
              x: editingPoint.x,
              y: editingPoint.y,
            });

            updated[editingPoint.index] = {
              ...editingPoint,
              colors: overlapping.map((e) => e.color),
            };
            setPoints(updated);
            setEditingPoint(null);
          }}
          style={{
            backgroundColor: " #641434",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
          }}
        >
          Guardar
        </button>
        <button
          onClick={() => {
            const updated = [...points];
            updated.splice(editingPoint.index, 1);
            setPoints(updated);
            setEditingPoint(null);
          }}
          style={{
            backgroundColor: " #a4161a",
            color: "#fff",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
          }}
        >
          Eliminar
        </button>
        <button
          onClick={() => setEditingPoint(null)}
          style={{
            backgroundColor: "#888",
            color: " #1e1e1e",
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
{editingPoint && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(139, 29, 81,0.2)",
      zIndex: 1000,
    }}
    onClick={() => setEditingPoint(null)}
  />
)}

    </div>
  );
};

export default Perfiles;
