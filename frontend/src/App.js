// ==========================
// client/src/App.js
// ==========================

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import Analytics from "./pages/Analytics";
import Signup from "./pages/Signup";

function App() {

  return (

    <BrowserRouter>

      <Routes>

<Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/interview"
          element={<Interview />}
        />
        <Route
  path="/result"
  element={<Result />}
/>
  <Route
    path="/analytics"
    element={<Analytics />}
  />

      </Routes>

    </BrowserRouter>
  );
}

export default App;