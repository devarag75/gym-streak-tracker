import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkoutLogger from './pages/WorkoutLogger';
import History from './pages/History';
import WeightTracker from './pages/WeightTracker';
import Analytics from './pages/Analytics';
import Friends from './pages/Friends';
import Templates from './pages/Templates';
import Settings from './pages/Settings';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<WorkoutLogger />} />
          <Route path="/history" element={<History />} />
          <Route path="/weight" element={<WeightTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
