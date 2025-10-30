
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

const Header: React.FC = () => {
  const { user, profile, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <svg className="h-8 w-auto text-zankli-orange-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z" />
            </svg>
            <span className="ml-3 font-bold text-xl text-gray-800">
              Zankli Medical Centre
            </span>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4 hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
             <UserIcon className="h-6 w-6 text-gray-500 sm:hidden" />
            <button
              onClick={logout}
              className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-zankli-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zankli-orange-500 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;