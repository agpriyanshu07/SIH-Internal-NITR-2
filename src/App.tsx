import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { ThresholdsProvider } from './state/thresholds';
import { Landing } from './routes/Landing';
import { Dashboard } from './routes/Dashboard';
import { Catalogue } from './routes/Catalogue';
import { Thresholds } from './routes/Thresholds';
import { ManoeuvreLog } from './routes/ManoeuvreLog';
import { SignIn } from './routes/SignIn';
import { Status } from './routes/Status';

/**
 * Route-level code splitting.
 *
 * Three routes carry weight nobody has asked for yet when the dashboard paints:
 *
 *   Analysis          the whole consequence chain — breakup, thermal, decay,
 *                     Kessler cascade — plus the Gabbard and latitude plots.
 *   ConjunctionDetail renders <Consequence>, which reaches the same chain. It
 *                     has to be split alongside Analysis or the chain simply
 *                     stays in the main bundle by another path and the split
 *                     buys nothing.
 *   Viewer            the orbital canvas and its animation loop.
 *
 * The rest stay eager. Catalogue, Thresholds, the manoeuvre log and the status
 * page are small, and a lazy boundary on each would trade a measured win for a
 * flash of fallback on every sidebar click.
 *
 * These are named exports, so each import is mapped to a default — React.lazy
 * takes a module with one and nothing else.
 */
const Analysis = lazy(() =>
  import('./routes/Analysis').then((m) => ({ default: m.Analysis })),
);
const ConjunctionDetail = lazy(() =>
  import('./routes/ConjunctionDetail').then((m) => ({ default: m.ConjunctionDetail })),
);
const Viewer = lazy(() =>
  import('./routes/Viewer').then((m) => ({ default: m.Viewer })),
);

/**
 * What a route looks like while its chunk arrives.
 *
 * Deliberately not a spinner: this app has never had one. The dashboard already
 * reports work in progress as a line of lowercase mono text with a live region
 * — "propagating 40%" — and this is the same thing said about a different kind
 * of work. Locally the chunk is there in a frame or two and this never paints;
 * on a slow connection it says what is happening instead of spinning.
 */
const RouteFallback = () => (
  <div className="px-6 py-8">
    <span className="num text-xs- text-tertiary" role="status" aria-live="polite">
      loading workspace…
    </span>
  </div>
);

export function App() {
  return (
    <ThresholdsProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/console" element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route
            path="conjunction/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ConjunctionDetail />
              </Suspense>
            }
          />
          <Route path="catalogue" element={<Catalogue />} />
          <Route
            path="viewer"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Viewer />
              </Suspense>
            }
          />
          <Route path="thresholds" element={<Thresholds />} />
          <Route path="manoeuvres" element={<ManoeuvreLog />} />
          <Route
            path="analysis"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Analysis />
              </Suspense>
            }
          />
          <Route path="status" element={<Status />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThresholdsProvider>
  );
}
