import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { FixturesPage } from './modules/Fixtures/FixturesPage';
import { ClubsPage } from './modules/Clubs/ClubsPage';
import { PlayersPage } from './modules/Players/PlayersPage';
import { ManagerPage } from './modules/Managers/ManagerPage';
import { LeaguePage } from './modules/Leagues/LeaguePage';

function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<FixturesPage />} />
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/managers" element={<ManagerPage />} />
          <Route path="/leagues" element={<LeaguePage />} />
        </Routes>
      </Layout>
    </AppProvider>
  );
}

export default App;

