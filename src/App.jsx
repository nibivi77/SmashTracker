import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import NewRecord from "./pages/NewRecord";
import Record from "./pages/Records";

function App() {

  return (
    <>
      <BrowserRouter basename={'/SmashTracker'}>
        <Header />
        <Routes>
          <Route path="/new" element={<NewRecord />} />
          <Route path="/records" element={<Record />} />
          <Route path="*" element={<NewRecord />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
