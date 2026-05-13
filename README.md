# Debye Bio-Electronics Suite

Debye is a prototype EDA environment for bio-electronic interfaces. The React designer is backed by Vercel Go API functions that compute tissue/electrode physics, design-rule checks, grounded copilot responses, and generated starting designs.

## Backend API

- `POST /api/simulate` runs Cole-Cole tissue impedance, Randles interface impedance with CPE and Warburg diffusion, Nernst potential, integrated noise budget, SNR, deterministic time-domain output, Nyquist data, Monte Carlo runs, and material variants.
- `POST /api/drc` runs bio-electronic DRC/ERC checks for impedance, charge injection, reference electrodes, motion artifact filtering, chronic encapsulation, material approval, and architecture completeness.
- `POST /api/copilot` calls Gemini server-side when `GEMINI_API_KEY` is present. Without the key, it returns deterministic grounded responses from the curated knowledge base.
- `POST /api/generate-design` creates a schema-versioned canvas graph and immediately validates it.
- `GET /api/knowledge` returns tissue, material, signal-band, and citation records.

## Scientific Grounding

Initial records cite:

- Gabriel et al. dielectric tissue measurements and parametric models: https://pubmed.ncbi.nlm.nih.gov/8938025/ and https://pubmed.ncbi.nlm.nih.gov/8938026/
- Cogan, neural stimulation and recording electrodes: https://www.annualreviews.org/content/journals/10.1146/annurev.bioeng.10.061807.160518
- Randles electrode kinetics: https://pubs.rsc.org/en/content/articlehtml/1947/df/df9470100011

## Local Checks

```bash
npm run lint
npm run build
go test ./api/... ./internal/...
```

On Windows in this workspace, Go may need to be invoked with its full path after installation:

```powershell
$env:GOCACHE='D:\Debye\debye-bio\.gocache'
& 'C:\Program Files\Go\bin\go.exe' test ./api/... ./internal/...
```

## Environment

Set `GEMINI_API_KEY` in Vercel project environment variables for server-side copilot reasoning. Do not expose Gemini keys with `VITE_` browser environment variables.
