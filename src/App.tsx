import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { TeamProvider } from './context/TeamContext';
import { FPLDataProvider } from './context/FPLDataContext';
import { Layout } from './components/Layout';
import { FixturesPage } from './modules/Fixtures/FixturesPage';
import { ClubsPage } from './modules/Clubs/ClubsPage';
import { PlayersPage } from './modules/Players/PlayersPage';
import { ManagerPage } from './modules/Managers/ManagerPage';
import { LeaguePage } from './modules/Leagues/LeaguePage';
import { MyTeamPage } from './modules/MyTeam/MyTeamPage';
import { PlayerDetailPage } from './modules/MyTeam/PlayerDetailPage';
import { PlayerComparePage } from './modules/MyTeam/PlayerComparePage';

function App() {
  return (
    <AppProvider>
      <FPLDataProvider>
        <TeamProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<FixturesPage />} />
              <Route path="/clubs" element={<ClubsPage />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/managers" element={<ManagerPage />} />
              <Route path="/leagues" element={<LeaguePage />} />
              <Route path="/my-team" element={<MyTeamPage />} />
              <Route path="/my-team/player/:playerId" element={<PlayerDetailPage />} />
              <Route path="/my-team/compare" element={<PlayerComparePage />} />
            </Routes>
          </Layout>
        </TeamProvider>
      </FPLDataProvider>
    </AppProvider>
  );
}

export default App;

