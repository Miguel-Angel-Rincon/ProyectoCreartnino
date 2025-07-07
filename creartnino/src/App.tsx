// src/App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import Routesweb from "./Routesweb";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <Router>
      <Routesweb />
      
        <AppRoutes />
      
    </Router>
  );
}

export default App;
