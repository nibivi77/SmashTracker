import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Header from "./components/Header";
import NewRecord from "./pages/NewRecord";
import Records from "./pages/Records";
import AllRecords from "./pages/AllRecords";
import TopTeams from "./pages/TopTeams";
import CharacterRankings from "./pages/CharacterRankings";
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
            <Route path="character-rankings" element={<CharacterRankings />} />
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
