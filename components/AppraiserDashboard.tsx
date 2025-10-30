
import React, { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppraisals } from '../hooks/useAppraisals';
import AppraisalForm from './AppraisalForm';
import { PlusCircle, Search, LoaderCircle } from 'lucide-react';
import { Appraisal, AppraisalStatus, Department } from '../types';

const AppraiserDashboard: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { profile } = useAuth();
  const { appraisals, loading } = useAppraisals();

  if (!profile) return null;

  const filteredAppraisals = useMemo(() => {
    if (!searchQuery) return appraisals;
    return appraisals.filter(app => 
        app.employee_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appraisals, searchQuery]);

  const groupedByDepartment = useMemo(() => {
    return filteredAppraisals.reduce((acc, appraisal) => {
        (acc[appraisal.department] = acc[appraisal.department] || []).push(appraisal);
        return acc;
    }, {} as Record<Department, Appraisal[]>);
  }, [filteredAppraisals]);

  if (isCreating) {
    return <AppraisalForm onCancel={() => setIsCreating(false)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Appraiser Dashboard</h1>
            <p className="text-gray-500 mt-1">Create and track employee performance appraisals.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-zankli-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-zankli-orange-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zankli-orange-500"
        >
          <PlusCircle size={20} />
          New Appraisal
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by employee name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zankli-orange-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-zankli-orange-600" />
        </div>
      ) : Object.entries(groupedByDepartment).length > 0 ? Object.entries(groupedByDepartment).map(([department, departmentAppraisals]) => (
        <div key={department} className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-3">{department}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(departmentAppraisals as Appraisal[]).map((appraisal: Appraisal) => (
                  <tr key={appraisal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appraisal.employee_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(appraisal.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appraisal.status === AppraisalStatus.COMPLETED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {appraisal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )) : (
        <div className="text-center text-gray-500 py-16 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-medium">{searchQuery ? 'No Results Found' : 'No Appraisals Yet'}</h3>
          <p className="mt-1">{searchQuery ? `No appraisals found for "${searchQuery}".` : 'Click "New Appraisal" to get started.'}</p>
        </div>
      )}
    </div>
  );
};

export default AppraiserDashboard;