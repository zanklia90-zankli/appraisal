
import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppraisals } from '../hooks/useAppraisals';
import { Department, Score } from '../types';
import { DEPARTMENTS, APPRAISAL_SECTIONS, QUESTION_LABELS } from '../constants';
import { calculateScores, getScoreLegend } from '../utils/helpers';
import { X, Send, AlertTriangle, LoaderCircle } from 'lucide-react';
import SignaturePad, { SignaturePadHandle } from './ui/SignaturePad';

interface AppraisalFormProps {
  onCancel: () => void;
}

const ScoreLegend = () => (
    <div className="p-4 bg-zankli-cream-100 rounded-lg flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
        <h3 className="font-semibold text-gray-800 mr-4">Scoring Guide:</h3>
        <span><span className="font-bold text-red-600">0-2:</span> Poor</span>
        <span><span className="font-bold text-yellow-600">3-4:</span> Fair</span>
        <span><span className="font-bold text-blue-600">5-7:</span> Good</span>
        <span><span className="font-bold text-green-600">8-10:</span> Very Good</span>
    </div>
);

const AppraisalForm: React.FC<AppraisalFormProps> = ({ onCancel }) => {
  const { user } = useAuth();
  const { addAppraisal } = useAppraisals();

  const allQuestions = useMemo(() => APPRAISAL_SECTIONS.flatMap(s => s.questions), []);
  
  // Form State
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState<Department | ''>('');
  const [hodName, setHodName] = useState('');
  const [scores, setScores] = useState<Score>(() => 
    allQuestions.reduce((acc, q) => ({ ...acc, [q]: 5 }), {})
  );
  const [comments, setComments] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const signaturePadRef = useRef<SignaturePadHandle>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [error, setError] = useState('');
  
  const clearSignature = () => {
      signaturePadRef.current?.clear();
      setSignatureDataUrl('');
  };

  const handleScoreChange = (question: string, value: number) => {
    setScores(prev => ({ ...prev, [question]: value }));
  };
  
  const { average, percentage } = useMemo(() => calculateScores(scores), [scores]);
  const overallRating = useMemo(() => getScoreLegend(average), [average]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!employeeName || !department || !hodName) {
      setError('Please fill in employee name, department, and HOD name.');
      return;
    }
    if (!signatureDataUrl) {
      setError('HOD signature is required.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!user || !department) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await addAppraisal({
        employee_name: employeeName,
        department,
        hod_name: hodName,
        scores,
        comments,
        created_by: user.id,
      }, signatureDataUrl);
      
      setShowConfirmation(false);
      onCancel(); // Go back to dashboard
    } catch (err: any) {
        console.error("Submission failed:", err);
        setError(err.message || 'An unexpected error occurred. Please try again.');
        setShowConfirmation(false); // Hide modal on error to show the message on form
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-md space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">New Performance Appraisal</h1>
          <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-lg font-semibold text-gray-700 mb-2 col-span-full">Employee Details</legend>
          <div>
            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <input type="text" id="employeeName" value={employeeName} onChange={e => setEmployeeName(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zankli-orange-500 focus:border-transparent" required />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select id="department" value={department} onChange={e => setDepartment(e.target.value as Department)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zankli-orange-500 focus:border-transparent" required >
              <option value="" disabled>Select Department</option>
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </fieldset>
        
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">Performance Scoring</h2>
            <ScoreLegend />
        </div>
        
        <div className="space-y-6">
          {APPRAISAL_SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-zankli-orange-100 pb-2 mb-4">{section.title}</h3>
              <div className="space-y-4">
                {section.questions.map(q => (
                  <div key={q} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm text-gray-600">{QUESTION_LABELS[q]}</label>
                    <div className="flex items-center gap-4">
                      <input type="range" min="0" max="10" value={scores[q]} onChange={e => handleScoreChange(q, parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-zankli-orange-600" />
                      <span className="font-bold text-lg text-zankli-orange-700 w-8 text-center">{scores[q]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <fieldset>
             <legend className="text-lg font-semibold text-gray-700 mb-4 col-span-full">Appraiser's Attestation</legend>
             <div className="space-y-6">
                <div>
                  <label htmlFor="hodName" className="block text-sm font-medium text-gray-700 mb-1">Appraiser / HOD Name</label>
                  <input type="text" id="hodName" value={hodName} onChange={e => setHodName(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zankli-orange-500 focus:border-transparent" required />
                </div>
                 <div>
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Overall Comments</label>
                    <textarea id="comments" rows={4} value={comments} onChange={e => setComments(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zankli-orange-500 focus:border-transparent" placeholder="Provide a summary of the employee's performance..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HOD Signature</label>
                  <SignaturePad ref={signaturePadRef} onEnd={setSignatureDataUrl} />
                  <button type="button" onClick={clearSignature} className="text-sm text-zankli-orange-600 hover:underline mt-1" disabled={isSubmitting}>Clear Signature</button>
                </div>
            </div>
        </fieldset>

        {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg">{error}</p>}

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="px-6 py-2 bg-zankli-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-zankli-orange-700 flex items-center gap-2 transition-all transform hover:scale-105 disabled:bg-zankli-orange-400 disabled:cursor-not-allowed" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send size={16} />}
            {isSubmitting ? 'Submitting...' : 'Review & Submit'}
          </button>
        </div>
      </form>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8 space-y-6 animate-fade-in-up">
              <div className="flex items-center gap-4">
                <div className="bg-zankli-orange-100 p-2 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-zankli-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Confirm Submission</h2>
              </div>
               <p className="text-gray-600">
                Please review the details below before submitting. This action cannot be undone.
              </p>
              <div className="border-t border-b border-gray-200 py-4 space-y-3 text-sm">
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Employee:</span> <span className="text-gray-800 font-medium">{employeeName}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Department:</span> <span className="text-gray-800 font-medium">{department}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">HOD Name:</span> <span className="text-gray-800 font-medium">{hodName}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Overall Score:</span> <span className="font-bold text-gray-900">{percentage.toFixed(2)}%</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">Rating:</span> <span className="font-bold text-zankli-orange-700">{overallRating}</span></div>
              </div>
             
              <div className="flex justify-end gap-4">
                  <button onClick={() => setShowConfirmation(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" disabled={isSubmitting}>Back to Edit</button>
                  <button onClick={handleConfirmSubmit} className="px-6 py-2 bg-zankli-orange-600 text-white font-semibold rounded-lg shadow-sm hover:bg-zankli-orange-700 transition-colors flex items-center gap-2 disabled:bg-zankli-orange-400 disabled:cursor-wait" disabled={isSubmitting}>
                      {isSubmitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
                      {isSubmitting ? 'Confirming...' : 'Confirm & Submit'}
                  </button>
              </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
        .touch-none {
          touch-action: none;
        }
      `}</style>
    </>
  );
};

export default AppraisalForm;