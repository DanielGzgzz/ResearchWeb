import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Electron, Proton } from './components/geons';
import { Sidebar } from './components/Sidebar';

export type Phenomenon = 'electron' | 'proton' | 'hydrogen';

function App() {
  const [selectedPhenomenon, setSelectedPhenomenon] = useState<Phenomenon>('electron');

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#050510] text-slate-200 font-sans">
      {/* 3D Canvas Area */}
      <div className="flex-grow h-[60vh] md:h-full relative">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <color attach="background" args={['#050510']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <OrbitControls makeDefault />

          {selectedPhenomenon === 'electron' && <Electron />}
          {selectedPhenomenon === 'proton' && <Proton />}
          {selectedPhenomenon === 'hydrogen' && (
            <group>
              <Proton radius={1.5} tubeRadius={0.3} />
              <Electron radius={4} tubeRadius={0.15} position={[0, 0, 0]} />
            </group>
          )}

          {/* Simple axis helpers and labels */}
          <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, -5, 0]} />
        </Canvas>
      </div>

      {/* UI Sidebar Area */}
      <Sidebar
        selected={selectedPhenomenon}
        onSelect={setSelectedPhenomenon}
      />
    </div>
  );
}

export default App;
