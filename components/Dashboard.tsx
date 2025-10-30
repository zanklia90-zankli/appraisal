
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import AppraiserDashboard from './AppraiserDashboard';
import ApproverDashboard from './ApproverDashboard';
import { LoaderCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading || !profile) {
    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
            <LoaderCircle className="h-8 w-8 text-zankli-orange-600 animate-spin" />
        </main>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case UserRole.APPRAISER:
        return <AppraiserDashboard />;
      case UserRole.HR:
      case UserRole.DOCS:
      case UserRole.MD:
      case UserRole.CHAIRMAN:
        return <ApproverDashboard />;
      default:
        return <div>Invalid user role. Please contact support.</div>;
    }
  };

  return <main className="container mx-auto p-4 sm:p-6 lg:p-8">{renderDashboard()}</main>;
};

export default Dashboard;