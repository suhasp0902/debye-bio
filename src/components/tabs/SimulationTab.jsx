import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

export default function SimulationTab({ data, isRunning }) {
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
          <div>
            No simulation data. Click "Simulate" to run analysis.
          </div>
        )}
      </div>
    );
  }

  const { eisData, noiseSources, impedance1kHz, noiseTotal, snr, signalDetectable } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-2 rounded shadow-lg text-xs">
          <p className="text-text-secondary mb-1">{`Freq: ${Number(label).toExponential(2)} Hz`}</p>
          <p className="text-accent-primary">{`|Z|: ${payload[0].value.toExponential(2)} Ω`}</p>
          <p className="text-accent-secondary">{`Phase: ${payload[1].value.toFixed(1)}°`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-2 rounded shadow-lg text-xs">
          <p className="text-text-primary">{`${label}: ${payload[0].value} µVrms`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 bg-surface">
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        <div className="flex-1 bg-surface-raised border border-border rounded-md p-3 relative flex flex-col">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Electrode Impedance Spectrum</div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eisData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
                <XAxis dataKey="frequency" scale="log" domain={['dataMin', 'dataMax']} type="number" stroke="#475569" fontSize={10} tickFormatter={(val) => val.toExponential(0)} />
                <YAxis yAxisId="left" scale="log" domain={['dataMin', 'dataMax']} stroke="#6366F1" fontSize={10} tickFormatter={(val) => val.toExponential(0)} />
                <YAxis yAxisId="right" orientation="right" domain={[-90, 0]} stroke="#22D3EE" fontSize={10} />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine x={1000} stroke="#94A3B8" strokeDasharray="3 3" yAxisId="left" label={{ position: 'top', value: `1 kHz: ${impedance1kHz}`, fill: '#94A3B8', fontSize: 10 }} />
                <Line yAxisId="left" type="monotone" dataKey="magnitude" stroke="#6366F1" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1000} />
                <Line yAxisId="right" type="monotone" dataKey="phase" stroke="#22D3EE" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-1 bg-surface-raised border border-border rounded-md p-3 flex flex-col">
          <div className="text-xs font-bold text-text-primary mb-2 shrink-0">Noise Budget</div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={noiseSources} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={80} />
                <RechartsTooltip content={<CustomBarTooltip />} cursor={{fill: '#1A1A24'}} />
                <ReferenceLine x={noiseTotal} stroke="#6366F1" strokeDasharray="3 3" label={{ position: 'top', value: `Total: ${noiseTotal} µV`, fill: '#6366F1', fontSize: 10 }} />
                <Bar dataKey="value" isAnimationActive={true} animationDuration={1000} barSize={12}>
                  {noiseSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(238, 80%, ${60 - index * 5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="h-[40px] border-t border-border bg-surface-raised flex items-center justify-between px-6 shrink-0">
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Impedance @ 1kHz:</span>
            <span className={`font-mono font-bold ${impedance1kHz.includes('2.1') ? 'text-accent-warning' : 'text-accent-success'}`}>{impedance1kHz}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Total Noise:</span>
            <span className="font-mono font-bold text-accent-success">{noiseTotal} µVrms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">SNR:</span>
            <span className="font-mono font-bold text-accent-success">{snr} dB ✓</span>
          </div>
        </div>
        <div>
          {signalDetectable && (
            <div className="px-3 py-0.5 rounded-full bg-accent-success/20 border border-accent-success/50 text-accent-success text-xs font-bold tracking-wide">
              SIGNAL DETECTABLE
            </div>
          )}
        </div>
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
