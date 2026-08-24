import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ThresholdsProvider } from './state/thresholds';
import { Landing } from './routes/Landing';
import { SignIn } from './routes/SignIn';

/**
 * Route-level code splitting.
 *
 * The split that matters is the console as a whole. `/` is the first page
 * anyone sees, and it was paying for the entire engine before it could paint:
 * Shell and Dashboard reach data/conjunctions and data/objects, which is 632 kB
 * of committed screening result plus satellite.js running the TLE parse at
 * import time. None of it is needed to render three figures and a canvas.
 *
 * So Landing and SignIn stay eager and everything under /console is deferred.
 * Landing now imports data/landing instead — a 44 kB summary generated from the
 * same run, carrying six rounded numbers per object rather than a SpaceObject
 * with its element sets.
 *
 * Analysis, ConjunctionDetail and Viewer stay split from the console bundle as
 * well, for the reason they always were: the consequence chain — breakup,
 * thermal, decay, Kessler cascade — is not needed to look at a table of events.
 * ConjunctionDetail has to go with Analysis or the chain stays behind by the
 * other path and the split buys nothing.
 *
 * These are named exports, so each import is mapped to a default — React.lazy
 * takes a module with one and nothing else.
 */
const Shell = lazy(() => import('./components/Shell').then((m) => ({ default: m.Shell })));
const Dashboard = lazy(() =>
  import('./routes/Dashboard').then((m) => ({ default: m.Dashboard })),
);
const Catalogue = lazy(() =>
  import('./routes/Catalogue').then((m) => ({ default: m.Catalogue })),
);
const Thresholds = lazy(() =>
  import('./routes/Thresholds').then((m) => ({ default: m.Thresholds })),
);
const ManoeuvreLog = lazy(() =>
  import('./routes/ManoeuvreLog').then((m) => ({ default: m.ManoeuvreLog })),
);
const Status = lazy(() => import('./routes/Status').then((m) => ({ default: m.Status })));
const Analysis = lazy(() =>
  import('./routes/Analysis').then((m) => ({ default: m.Analysis })),
);
const ConjunctionDetail = lazy(() =>
  import('./routes/ConjunctionDetail').then((m) => ({ default: m.ConjunctionDetail })),
);
const Viewer = lazy(() => import('./routes/Viewer').then((m) => ({ default: m.Viewer })));

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
        <Route
          path="/console"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Shell />
            </Suspense>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="conjunction/:id" element={<ConjunctionDetail />} />
          <Route path="catalogue" element={<Catalogue />} />
          <Route path="viewer" element={<Viewer />} />
          <Route path="thresholds" element={<Thresholds />} />
          <Route path="manoeuvres" element={<ManoeuvreLog />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="status" element={<Status />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThresholdsProvider>
  );
}
