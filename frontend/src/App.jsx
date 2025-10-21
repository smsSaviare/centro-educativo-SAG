import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import CourseEditor from './pages/CourseEditor';
import ResetPassword from './pages/ResetPassword';
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
