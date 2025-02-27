// import * as React from 'react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
// import BavariaMapTwo from './components/BavariaMapTwo';
import BavariaMapThree from './components/BavariaMapThree';
import { CSVLoader } from '@loaders.gl/csv';
import { load } from '@loaders.gl/core';
import MapComponent from './components/TestMapComponent';


// const App = () => {
//   const [data, setData] = useState(null);

//   // Загрузка данных
//   useEffect(() => {
//     const loadData = async () => {
//       const result = await load(
//         'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv',
//         CSVLoader
//       );
//       const points = result.data
//         .map(d => (Number.isFinite(d.lng) ? [d.lng, d.lat] : null))
//         .filter(Boolean);
//       setData(points);
//     };

//     loadData();
//   }, []);

//   return (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <h1 style={{ textAlign: 'center', margin: '10px 0' }}>3D Heatmap</h1>
//       <TestMapComponent data={data} />
//     </div>
//   );
// };

// export default App;


function App() {
  return <BavariaMapThree />;
}
export default App