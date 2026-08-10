import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Savings from './pages/Savings';
import Reports from './pages/Reports';

import ProtectedRoute from './ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={
            <h1 className="mt-20 text-center text-4xl text-blue-600">
              Finance Advisor
            </h1>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>

          <Route element={<Layout />}>

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/transactions" element={<Transactions />} />

            <Route path="/budgets" element={<Budgets />} />

            <Route path="/savings" element={<Savings />} />

            <Route path="/reports" element={<Reports />} />

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;