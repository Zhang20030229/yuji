import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Mood from '@/pages/Mood'
import Decision from '@/pages/Decision'
import Community from '@/pages/Community'
import About from '@/pages/About'
import Auth from '@/pages/Auth'
import Report from '@/pages/Report'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/decision" element={<Decision />} />
          <Route path="/community" element={<Community />} />
          <Route path="/report" element={<Report />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
