import { Routes, Route } from 'react-router-dom';
import Home from "./components/Home";
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';

function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/reset" element={<ResetPassword/>} />
      <Route path="/course/:id" element={<PrivateRoute><CourseView/></PrivateRoute>} />
      <Route path="/editor" element={<PrivateRoute requiredRole="teacher"><CourseEditor/></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
    </Routes>
  );
}
export default App;
