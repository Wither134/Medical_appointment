import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { routes }       from './routes';
import './styles/index.css';

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
