import { Navigate, Route, Routes } from 'react-router-dom';
import { Shell } from './components/Shell';
import { ThresholdsProvider } from './state/thresholds';
import { Landing } from './routes/Landing';
import { Dashboard } from './routes/Dashboard';
import { ConjunctionDetail } from './routes/ConjunctionDetail';
import { Catalogue } from './routes/Catalogue';
import { Viewer } from './routes/Viewer';
import { Thresholds } from './routes/Thresholds';
import { ManoeuvreLog } from './routes/ManoeuvreLog';
import { Analysis } from './routes/Analysis';
import { SignIn } from './routes/SignIn';
import { Status } from './routes/Status';

export function App() {
  return (
    <ThresholdsProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/console" element={<Shell />}>
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
