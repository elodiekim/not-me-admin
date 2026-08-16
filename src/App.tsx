import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ComingSoon } from '@/components/layout/ComingSoon';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { AuthProvider } from '@/providers/AuthProvider';
import { RequireAuth } from '@/routes/RequireAuth';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<DashboardScreen />} />
                <Route path="/missions" element={<ComingSoon title="Missions" />} />
                <Route path="/users" element={<ComingSoon title="Users" />} />
                <Route path="/statistics" element={<ComingSoon title="Statistics" />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
