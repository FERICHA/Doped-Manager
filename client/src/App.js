import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import Login from './Auth/Login';
import DashboardPage from "./pages/DashboardPage";
import "bootstrap/dist/css/bootstrap.min.css";
import TransactionsPage from "./pages/TransactionsPage";
import ProductsPage from "./pages/ProductsPage";
import EmployeesPage from "./pages/EmployeesPage";
import AbsencesPage from "./pages/AbsencesPage";
import SettingsPage from "./pages/SettingsPage";
import Loader from "./components/Partials/Loader";

function App() {
  return (
    <Router>
      <AppWithLoader />
    </Router>
  );
}

function AppWithLoader() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); 
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="App">
      {loading ? (
        <Loader />
      ) : (
        <Routes> 
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/absences" element={<AbsencesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      )}
    </div>
  );
}

export default App;