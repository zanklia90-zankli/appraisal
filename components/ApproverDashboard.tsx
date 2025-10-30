
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppraisals } from '../hooks/useAppraisals';
import { Department, Appraisal, UserRole } from '../types';
import { DEPARTMENTS, ROLE_NAMES } from '../constants';
import { downloadAsPdf } from '../services/pdfService';
import AppraisalView from './AppraisalView';
import PrintableDepartmentSummary from './PrintableDepartmentSummary';
import { Filter, Download, Search, LoaderCircle } from 'lucide-react';

const ApproverDashboard: React.FC = () => {
  const { profile, logout } = useAuth();
  const { appraisals, loading } = useAppraisals();
  const [selectedDept, setSelectedDept] = useState<Department | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState<Department | null>(null);

  const filteredAppraisals = useMemo(() => {
    let sorted = [...appraisals];
    
    if (selectedDept !== 'ALL') {
      sorted = sorted.filter(app => app.department === selectedDept);
    }

    if (searchQuery) {
        sorted = sorted.filter(app => 
            app.employee_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return sorted;
  }, [appraisals, selectedDept, searchQuery]);
  
  const groupedByDepartment = useMemo(() => {
    return filteredAppraisals.reduce((acc, appraisal) => {
        (acc[appraisal.department] = acc[appraisal.department] || []).push(appraisal);
        return acc;
    }, {} as Record<Department, Appraisal[]>);
  }, [filteredAppraisals]);

  const handleDownloadDept = (dept: Department) => {
     setIsPrinting(dept);
  };

  useEffect(() => {
    if (isPrinting) {
      const elementId = `print-summary-area-${isPrinting}`;
      setTimeout(() => {
        downloadAsPdf(elementId, `Appraisal-Summary-${isPrinting}`, logout)
          .finally(() => {
            setIsPrinting(null);
          });
      }, 100); 
    }
  }, [isPrinting, logout]);

  if (!profile) return null;

  if (selectedAppraisalId) {
    return <AppraisalView appraisalId={selectedAppraisalId} onBack={() => setSelectedAppraisalId(null)} />;
  }

  const canBatchDownload = profile.role === UserRole.HR || profile.role === UserRole.CHAIRMAN;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">{ROLE_NAMES[profile.role]} Dashboard</h1>
            <p className="text-gray-500 mt-1">Review and approve employee appraisals.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zankli-orange-500"
            />
          </div>
          <div className="flex-1 flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
              <Filter size={16} className="text-gray-500 ml-1 flex-shrink-0" />
              <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as Department | 'ALL')}
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer"
              >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-zankli-orange-600" />
        </div>
      ) : Object.entries(groupedByDepartment).length > 0 ? Object.entries(groupedByDepartment).map(([department, departmentAppraisals]) => (
        <div key={department} className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 border-b border-gray-200 pb-3">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">{department}</h2>
            {canBatchDownload && (
                <button 
                  onClick={() => handleDownloadDept(department as Department)}
                  disabled={isPrinting !== null}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-zankli-orange-50 text-zankli-orange-700 font-semibold rounded-lg hover:bg-zankli-orange-100 transition-colors disabled:opacity-50 disabled:cursor-wait w-full sm:w-auto"
                >
                    {isPrinting === department ? 'Generating...' : <><Download size={16} /> Download Summary</>}
                </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(departmentAppraisals as Appraisal[]).map(appraisal => (
              <div key={appraisal.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-zankli-orange-300 transition-all cursor-pointer transform hover:-translate-y-1" onClick={() => setSelectedAppraisalId(appraisal.id)}>
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-gray-800">{appraisal.employee_name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${appraisal.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {appraisal.status}
                    </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 space-y-1">
                    <p><strong>Rating:</strong> <span className="font-semibold text-gray-700">{appraisal.overall_rating} ({appraisal.overall_score.toFixed(2)}%)</span></p>
                    <p><strong>Created:</strong> {new Date(appraisal.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <h3 className="text-lg font-medium text-gray-700">No Appraisals Found</h3>
                <p className="text-gray-500 mt-1">There are no appraisals matching your search and filter criteria.</p>
          </div>
       )}
       
      {isPrinting && groupedByDepartment[isPrinting] && (
          <div className="absolute top-0 -left-[9999px]" aria-hidden="true">
              <div id={`print-summary-area-${isPrinting}`} className="bg-white" style={{ width: '11in' }}>
                  <PrintableDepartmentSummary
                    department={isPrinting}
                    appraisals={groupedByDepartment[isPrinting] as Appraisal[]}
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default ApproverDashboard;
