
import React from 'react';
import { Appraisal, Department, AppraisalWithSignatures } from '../types';

interface PrintableDepartmentSummaryProps {
  department: Department;
  appraisals: Appraisal[];
}

const PrintableDepartmentSummary: React.FC<PrintableDepartmentSummaryProps> = ({ department, appraisals }) => {
  return (
    <div className="p-8 font-sans text-gray-800 bg-white">
      <header className="text-center border-b-2 border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Department Appraisal Summary</h1>
        <p className="text-xl text-gray-600">{department}</p>
        <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleDateString()}</p>
      </header>

      <table className="min-w-full divide-y divide-gray-300 border text-xs">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">Employee Name</th>
            <th scope="col" className="px-3 py-2 text-center font-semibold text-gray-900">Score</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">Rating</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">Appraiser Comment</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {appraisals.map((appraisal) => {
            return (
              <tr key={appraisal.id} style={{ breakInside: 'avoid' }}>
                <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-800">{appraisal.employee_name}</td>
                <td className="whitespace-nowrap px-3 py-2 text-center text-gray-700 font-bold">{appraisal.overall_score.toFixed(2)}%</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700">{appraisal.overall_rating}</td>
                <td className="px-3 py-2 text-gray-600" style={{ minWidth: '200px' }}>{appraisal.comments || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-2 text-gray-700">{appraisal.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableDepartmentSummary;
