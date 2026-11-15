# HMSA

Astronaut eye health monitor for long space missions, focused on SANS
(Spaceflight Associated Neuro-ocular Syndrome). Built for a NASA hackathon by team HMSA.

The frontend runs fully on mock data; the backend is coming later.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Structure

- `src/pages/`: Home, Learn, Checkups, Risk and treatment, Experiments, guided test runner
- `src/components/`: shared UI, including the anatomical `EyeAvatar.jsx` (do not edit)
- `src/services/api.js`: the only data source for components; set `VITE_API_URL` when the backend is ready
- `src/data/mockData.js`: mock data (imported only by `api.js`)
- `src/syndromes/`: syndrome modules (SANS now; bone, muscle, radiation, cardiovascular later)

All medical content is placeholder content, to be reviewed by a flight surgeon.

Deploys on Vercel; `vercel.json` routes all paths to `index.html` for React Router.
