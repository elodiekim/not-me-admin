import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { NotFoundScreen } from '@/components/layout/NotFoundScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { MissionDetailScreen } from '@/features/missions/MissionDetailScreen';
import { MissionsScreen } from '@/features/missions/MissionsScreen';
import { StatisticsScreen } from '@/features/statistics/StatisticsScreen';
import { UserDetailScreen } from '@/features/users/UserDetailScreen';
import { UsersScreen } from '@/features/users/UsersScreen';
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
                <Route path="/missions" element={<MissionsScreen />} />
                <Route path="/missions/:id" element={<MissionDetailScreen />} />
                <Route path="/users" element={<UsersScreen />} />
                <Route path="/users/:id" element={<UserDetailScreen />} />
                <Route path="/statistics" element={<StatisticsScreen />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
