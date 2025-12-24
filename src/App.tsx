import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chat from "./components/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Home from "./pages/Home";
import DocumentsMain from "./pages/DocumentsMain";
import ManageUsersMain from "./pages/ManageUsersMain";
import { useAuth } from "./Data/AuthData";
import Test from "./Test";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import TaskDashboard from "./pages/TaskDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user } = useAuth(); // Get user from context
  const userRole = user?.role; // Extract role safely

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client-dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TaskDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsMain />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manageusers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'employee']}>
                  <ManageUsersMain />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/test" element={<Test />} />


          </Routes>
        </main>
        <Footer />
        {(userRole === "admin" || userRole === "employee") && <Chat />}
      </div>
    </Router>
  );
}

export default App;
