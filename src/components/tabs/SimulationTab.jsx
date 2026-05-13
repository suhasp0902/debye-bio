import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, ScatterChart, Scatter } from 'recharts';

function EISTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border p-2 rounded shadow-lg text-xs">
      <p className="text-text-secondary mb-1">{`Freq: ${Number(label).toExponential(2)} Hz`}</p>
      <p className="text-accent-primary">{`|Z|: ${Number(payload[0].value).toExponential(2)} ohm`}</p>
      {payload[1] && <p className="text-accent-secondary">{`Phase: ${Number(payload[1].value).toFixed(1)} deg`}</p>}
    </div>
  );
}

function NoiseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border p-2 rounded shadow-lg text-xs">
      <p className="text-text-primary">{`${label}: ${payload[0].value} uVrms`}</p>
    </div>
  );
}

function fallbackTimeData(noiseTotal, snr) {
  const pts = [];
  const signalAmp = noiseTotal * Math.pow(10, snr / 20);
  let seed = Math.round(noiseTotal * 1000 + snr * 31);
  for (let i = 0; i < 100; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const t = i * 0.01;
    const sig = signalAmp * Math.sin(2 * Math.PI * 2 * t);
    const noise = ((seed % 10000) / 5000 - 1) * noiseTotal * 0.65;
    pts.push({ time: i, voltage: Number((sig + noise).toFixed(2)), signal: Number(sig.toFixed(2)), noise: Number(noise.toFixed(2)) });
  }
  return pts;
}

export default function SimulationTab({ data, isRunning }) {
  const timeData = useMemo(() => {
    if (!data) return [];
    return data.timeData?.length ? data.timeData : fallbackTimeData(data.noiseTotal || 1, data.snr || 0);
  }, [data]);

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-muted relative z-10 bg-surface">
        {isRunning ? (
          <div className="w-64">
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-accent-primary animate-[progress_1.5s_ease-in-out_forwards]" style={{ width: '100%' }} />
            </div>
            <div className="text-sm mt-4 text-center animate-pulse">Running simulation...</div>
          </div>
        ) : (
          <div>No simulation data. Click "Simulate" to run analysis.</div>
        )}
      </div>
    );
  }

  const { eisData, nyquistData, noiseSources, impedance1kHz, noiseTotal, snr, signalDetectable, physicsParams, safetyMargins, designVariants } = data;
  const snrOk = signalDetectable;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 bg-surface overflow-y-auto custom-scrollbar">
      <div className="flex-none grid grid-cols-3 gap-4 p-4 h-[240px] min-w-[900px]">
        <div className="bg-surface-raised border border-border rounded-md p-3 relative flex flex-col">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Electrode Impedance Spectrum</div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eisData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="frequency" scale="log" domain={['dataMin', 'dataMax']} type="number" stroke="#475569" fontSize={10} tickFormatter={(val) => Number(val).toExponential(0)} />
                <YAxis yAxisId="left" scale="log" domain={['dataMin', 'dataMax']} stroke="#6366F1" fontSize={10} tickFormatter={(val) => Number(val).toExponential(0)} />
                <YAxis yAxisId="right" orientation="right" domain={[-90, 0]} stroke="#22D3EE" fontSize={10} />
                <RechartsTooltip content={<EISTooltip />} />
                <ReferenceLine x={1000} stroke="#94A3B8" strokeDasharray="3 3" yAxisId="left" label={{ position: 'top', value: `1 kHz: ${impedance1kHz}`, fill: '#94A3B8', fontSize: 10 }} />
                <Line yAxisId="left" type="monotone" dataKey="magnitude" stroke="#6366F1" strokeWidth={2} dot={false} isAnimationActive animationDuration={1000} />
                <Line yAxisId="right" type="monotone" dataKey="phase" stroke="#22D3EE" strokeWidth={2} dot={false} isAnimationActive animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-raised border border-border rounded-md p-3 flex flex-col">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Noise Budget</div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={noiseSources} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={80} />
                <RechartsTooltip content={<NoiseTooltip />} cursor={{ fill: '#1A1A24' }} />
                <ReferenceLine x={noiseTotal} stroke="#6366F1" strokeDasharray="3 3" label={{ position: 'top', value: `Total: ${noiseTotal} uV`, fill: '#6366F1', fontSize: 10 }} />
                <Bar dataKey="value" isAnimationActive animationDuration={1000} barSize={12}>
                  {noiseSources.map((entry, index) => (
                    <Cell key={entry.name} fill={`hsl(238, 80%, ${60 - index * 5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-raised border border-border rounded-md p-3 flex flex-col">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Nyquist Plot</div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="zReal" type="number" stroke="#475569" fontSize={10} tickFormatter={(val) => Number(val).toExponential(0)} />
                <YAxis dataKey="negZImag" type="number" stroke="#22D3EE" fontSize={10} tickFormatter={(val) => Number(val).toExponential(0)} />
                <Scatter data={nyquistData || []} fill="#22D3EE" line lineType="joint" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex-none grid grid-cols-[1fr_300px_300px] gap-4 px-4 pb-4 h-[200px] min-w-[900px]">
        <div className="bg-surface-raised border border-border rounded-md p-3 relative flex flex-col min-w-[300px]">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Oscilloscope (Time Domain)</div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `${val}uV`} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#111118', borderColor: '#2A2A3A', fontSize: '10px' }} />
                <Line type="monotone" dataKey="voltage" stroke="#22D3EE" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={1000} name="Signal + Noise" />
                <Line type="monotone" dataKey="signal" stroke="#6366F1" strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} name="Ideal Signal" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-raised border border-border rounded-md p-3 flex flex-col">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Physics Grounding</div>
          <div className="flex-1 overflow-y-auto custom-scrollbar text-[10px] font-mono text-text-secondary space-y-2">
            <div>
              <span className="text-accent-primary block mb-1">Cole-Cole Tissue Model</span>
              <div className="grid grid-cols-2 gap-1">
                <div>R0: <span className="text-text-primary">{physicsParams?.r0} ohm-cm</span></div>
                <div>Rinf: <span className="text-text-primary">{physicsParams?.r_inf} ohm-cm</span></div>
                <div>Alpha: <span className="text-text-primary">{physicsParams?.cole_alpha}</span></div>
                <div>Tau: <span className="text-text-primary">{physicsParams?.tau} s</span></div>
              </div>
            </div>
            <div className="h-px bg-border my-1" />
            <div>
              <span className="text-accent-secondary block mb-1">Randles + CPE + Warburg</span>
              <div className="grid grid-cols-2 gap-1">
                <div>Rs: <span className="text-text-primary">{physicsParams?.rSolution} ohm</span></div>
                <div>Rct: <span className="text-text-primary">{physicsParams?.rCt} ohm</span></div>
                <div>Q: <span className="text-text-primary">{physicsParams?.cpeQ}</span></div>
                <div>Nernst: <span className="text-text-primary">{physicsParams?.nernst_mV} mV</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-raised border border-border rounded-md p-3 flex flex-col">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Design Variants</div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            {(designVariants || []).slice(0, 4).map(variant => (
              <div key={variant.material} className="grid grid-cols-[1fr_auto] gap-2 rounded border border-border bg-surface px-2 py-1.5 text-[10px]">
                <span className="truncate text-text-secondary">{variant.name}</span>
                <span className="font-mono text-text-primary">{variant.snr} dB</span>
              </div>
            ))}
            {safetyMargins && (
              <div className="mt-2 text-[10px] text-text-muted leading-relaxed">
                SNR margin: {safetyMargins.snrMarginDb} dB. Charge margin: {safetyMargins.chargeInjectionMargin}x.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[40px] border-t border-border bg-surface-raised flex items-center justify-between px-6 shrink-0">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Impedance @ 1kHz:</span>
            <span className="font-mono font-bold text-accent-success">{impedance1kHz}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Total Noise:</span>
            <span className="font-mono font-bold text-accent-success">{noiseTotal} uVrms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">SNR:</span>
            <span className={`font-mono font-bold ${snrOk ? 'text-accent-success' : 'text-accent-warning'}`}>{snr} dB</span>
          </div>
        </div>
        {signalDetectable && (
          <div className="px-3 py-0.5 rounded-full bg-accent-success/20 border border-accent-success/50 text-accent-success text-xs font-bold tracking-wide">
            SIGNAL DETECTABLE
          </div>
        )}
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
