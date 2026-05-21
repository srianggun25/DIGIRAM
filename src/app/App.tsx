import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AssessmentProvider } from '../contexts/AssessmentContext';
import { SimariLoginPage } from '../components/SimariLoginPage';
import { SimariHospitalDashboard } from '../components/SimariHospitalDashboard';
import { SimariDinkesDashboard } from '../components/SimariDinkesDashboard';
import { SimariMinistryDashboard } from '../components/SimariMinistryDashboard';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <SimariLoginPage />;
  }

  switch (user.role) {
    case 'hospital':
      return <SimariHospitalDashboard />;
    case 'health_office':
      return <SimariDinkesDashboard />;
    case 'ministry':
      return <SimariMinistryDashboard />;
    default:
      return <SimariLoginPage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AssessmentProvider>
        <AppContent />
      </AssessmentProvider>
    </AuthProvider>
  );
}
