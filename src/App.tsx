import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { handleGoogleRedirect } from './lib/googleAuth';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Overview from './pages/dashboard/Overview';
import CreateDatabase from './pages/dashboard/CreateDatabase';
import MyDatabases from './pages/dashboard/MyDatabases';
import QueryBuilder from './pages/dashboard/QueryBuilder';
import Export from './pages/dashboard/Export';
import Settings from './pages/dashboard/Settings';
import DatabaseExplorer from './pages/dashboard/DatabaseExplorer';

handleGoogleRedirect();

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Overview /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/create" element={<ProtectedRoute><DashboardLayout><CreateDatabase /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/databases" element={<ProtectedRoute><DashboardLayout><MyDatabases /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/databases/:id" element={<ProtectedRoute><DashboardLayout><DatabaseExplorer /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/query" element={<ProtectedRoute><DashboardLayout><QueryBuilder /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/export" element={<ProtectedRoute><DashboardLayout><Export /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
