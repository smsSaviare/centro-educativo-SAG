import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import CourseView from "./components/CourseView";
import CourseEditor from "./components/CourseEditor";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/course/:id" element={<PrivateRoute><CourseView /></PrivateRoute>} />
        <Route path="/editor" element={<PrivateRoute requiredRole="teacher"><CourseEditor /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/forgot" element={<ForgotPassword/>} />
      </Routes>
    </>
  );
}

export default App;
