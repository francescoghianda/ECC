import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import Home from "./Home";
import FindSmartApe from "./FindSmartApe";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/findSmartApe" element={<FindSmartApe />} />
      </Routes>
    </Router>
  )
}