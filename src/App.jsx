import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Header from "./components/Header";
import NewRecord from "./pages/NewRecord";
import Records from "./pages/Records";
import AllRecords from "./pages/AllRecords";
import TopTeams from "./pages/TopTeams";
import TopCharacterPerformances from "./pages/TopCharacterPerformances";
import TopPlayer1Performances from "./pages/TopPlayer1Performances";
import TopPlayer2Performances from "./pages/TopPlayer2Performances";
import Player1BestPerCharacter from "./pages/Player1BestPerCharacter";
import Player2BestPerCharacter from "./pages/Player2BestPerCharacter";
import CharacterSearch from "./pages/CharacterSearch";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter basename="/SmashTracker">
      <AppLayout>
        <Header />

        <Routes>
          <Route path="/" element={<Navigate to="/new" replace />} />
          <Route path="/new" element={<NewRecord />} />

          <Route path="/records" element={<Records />}>
            <Route index element={<AllRecords />} />
            <Route path="top-10" element={<TopTeams />} />
            <Route path="top-characters" element={<TopCharacterPerformances />} />
            <Route path="top-p1" element={<TopPlayer1Performances />} />
            <Route path="top-p2" element={<TopPlayer2Performances />} />
            <Route
              path="p1-best-per-character"
              element={<Player1BestPerCharacter />}
            />
            <Route
              path="p2-best-per-character"
              element={<Player2BestPerCharacter />}
            />
            <Route
              path="character-search"
              element={<CharacterSearch />}
            />
          </Route>

          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/new" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
