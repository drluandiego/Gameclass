import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPresent from './pages/admin/Present';
import AdminControlPanel from './pages/admin/ControlPanel';
import AdminEditor from './pages/admin/Editor';
import AdminRemoteControl from './pages/admin/RemoteControl';
import StudentRoom from './pages/student/Room';
import JoinRoom from './pages/student/JoinRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota inicial / Entrada de Alunos */}
        <Route path="/" element={<Home />} />

        {/* Sala de espera (QR code / código fixo) */}
        <Route path="/join/:roomCode" element={<JoinRoom />} />

        {/* Sala de aula do estudante (Sincronizada) */}
        <Route path="/room/:id" element={<StudentRoom />} />

        {/* Rotas do Professor */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/editor/:id" element={<AdminEditor />} />
        <Route path="/admin/present/:id" element={<AdminPresent />} />
        <Route path="/admin/panel/:id" element={<AdminControlPanel />} />
        <Route path="/admin/remote/:sessionId" element={<AdminRemoteControl />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
