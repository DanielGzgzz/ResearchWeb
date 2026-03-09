import type { Phenomenon } from '../App';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface SidebarProps {
  selected: Phenomenon;
  onSelect: (p: Phenomenon) => void;
}

export function Sidebar({ selected, onSelect }: SidebarProps) {
  const infoData = {
    electron: {
      title: 'Leptonic Architecture: The Electron',
      desc: 'Leptons are constructed from a continuous 1D circularly polarized photon track trapped in a stable quantum orbit. The topological twist generates a macroscopic negative monopole and intrinsic spin.',
      math: [
        { label: 'Compton Wavelength Confinement', expr: '4\\pi r = \\lambda_c' },
        { label: 'Structural Radius', expr: 'r = \\frac{\\hbar}{2m_e c} \\approx 1.93 \\times 10^{-13} \\text{ m}' },
        { label: 'Casimir Confinement Pressure', expr: 'F_{vac} = \\frac{\\hbar c}{2r^2} \\equiv \\frac{m_e c^2}{r}' },
      ],
      features: ['4π (720°) twisted Möbius double-loop', 'Continuous Green (+E), Red (-E), Purple (+B), Yellow (-B) mappings', 'Explains Dirac g=2 anomaly geometrically'],
    },
    proton: {
      title: 'Hadronic Architecture: The Proton',
      desc: 'Nucleons require a 3D architecture to distribute angular momentum without unspooling massive inertia. The geometric mechanical replacement for the strong force is 178,700 N of inward vacuum pressure.',
      math: [
        { label: 'Resting Radius', expr: 'R_p = \\frac{4\\hbar}{m_p c} \\approx 0.8412 \\text{ fm}' },
        { label: 'Inward Vacuum Pressure', expr: 'F_{vac} = \\frac{4\\hbar c}{R_p^2}' },
      ],
      features: ['(3,2)-Torus knot (Trefoil knot)', 'Three continuous spatial lobes (Quark replacement)', 'Integrates to +1e via two outward twists (+2/3e) and one inward (-1/3e)'],
    },
    hydrogen: {
      title: 'Hydrogen Atom',
      desc: 'An electron held in geometric orbit around a single central proton through interlocking Casimir shadow fields.',
      math: [
        { label: 'Gravitational Shadowing', expr: 'G = \\frac{P_{vac}\\sigma^{2}}{4\\pi m_{p}^{2}}' },
      ],
      features: ['Central dense Trefoil knot', 'Orbital expansive Möbius loop', 'Stable atomic equilibrium'],
    }
  };

  const currentInfo = infoData[selected];

  return (
    <div className="w-full md:w-[400px] h-[40vh] md:h-full bg-slate-900 border-t md:border-t-0 md:border-l border-slate-700 p-6 overflow-y-auto flex flex-col gap-6 shadow-2xl relative z-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
          Geon Framework
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-mono">By Daniel Gezin</p>
      </div>

      {/* Interactive Controls */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Select Phenomenon
        </h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelect('electron')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${selected === 'electron' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Electron (Möbius Double-Loop)
          </button>
          <button
            onClick={() => onSelect('proton')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${selected === 'proton' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Proton (Trefoil Knot)
          </button>
          <button
            onClick={() => onSelect('hydrogen')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${selected === 'hydrogen' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            Hydrogen Atom
          </button>
        </div>
      </div>

      {/* Dynamic Documentation */}
      <div className="flex-grow flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{currentInfo.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {currentInfo.desc}
          </p>
        </div>

        {/* Features List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Key Topologies</h3>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {currentInfo.features.map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>
        </div>

        {/* Mathematical Formulas via KaTeX */}
        <div className="mt-2 space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Geon Kinematics</h3>
          {currentInfo.math.map((m, i) => (
            <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">{m.label}</span>
              <div className="text-blue-300 overflow-x-auto overflow-y-hidden pb-1">
                <BlockMath math={m.expr} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Legend */}
      <div className="mt-auto pt-4 border-t border-slate-800">
        <h4 className="text-xs font-semibold text-slate-500 mb-2">Color Mapping Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> +E (Electric)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> -E (Electric)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></div> +B (Magnetic)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div> -B (Magnetic)</div>
        </div>
      </div>

    </div>
  );
}
