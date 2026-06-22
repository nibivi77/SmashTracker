import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import NewMatch from "./pages/NewMatch";
import Matches from "./pages/Matches";

function App() {

  return (
    <>
      <BrowserRouter basename={'/SmashTracker'}>
        <Header />
        <Routes>
          <Route path="/new" element={<NewMatch />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="*" element={<NewMatch />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
