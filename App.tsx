
import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Header from './components/ui/Header';
import { LoaderCircle } from 'lucide-react';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoaderCircle className="h-12 w-12 text-zankli-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      {user ? (
        <>
          <Header />
          <Dashboard />
        </>
      ) : (
        <LoginScreen />
      )}
    </div>
  );
};

export default App;