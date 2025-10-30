
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAppraisals } from '../hooks/useAppraisals';
import { AppraisalStatus, AppraisalWithSignatures } from '../types';
import { WORKFLOW_ORDER, ROLE_NAMES, APPRAISAL_SECTIONS, QUESTION_LABELS } from '../constants';
import { downloadAsPdf } from '../services/pdfService';
import { ArrowLeft, Download, Send, Edit, MessageSquare, CheckCircle, LoaderCircle } from 'lucide-react';
import SignaturePad, { SignaturePadHandle } from './ui/SignaturePad';

interface AppraisalViewProps {
  appraisalId: string;
  onBack: () => void;
}

const AppraisalView: React.FC<AppraisalViewProps> = ({ appraisalId, onBack }) => {
  const { profile, logout } = useAuth();
  const { getAppraisalDetails, approveAppraisal } = useAppraisals();
  const [appraisal, setAppraisal] = useState<AppraisalWithSignatures | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signaturePadRef = useRef<SignaturePadHandle>(null);
  const [approverSignature, setApproverSignature] = useState<string>('');

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    const details = await getAppraisalDetails(appraisalId);
    setAppraisal(details);
    setLoading(false);
  }, [appraisalId, getAppraisalDetails]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const canApprove = appraisal && profile ? WORKFLOW_ORDER[appraisal.status] === profile.role : false;

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setApproverSignature('');
  };

  const handleApprove = async () => {
    if (!appraisal) return;

    setError('');
    if (!approverSignature) {
        setError('Your signature is required to approve.');
        return;
    }
    
    setIsSubmitting(true);
    try {
      await approveAppraisal(appraisal.id, appraisal.status, approverSignature, comment);
      onBack();
    } catch (err: any) {
      console.error("Approval failed:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const pdfId = `appraisal-pdf-${appraisal?.id}`;

  if (loading) {
     return (
        <div className="flex justify-center items-center py-20">
            <LoaderCircle className="h-10 w-10 animate-spin text-zankli-orange-600" />
        </div>
     );
  }

  if (!appraisal || !profile) {
    return (
      <div className="text-center py-10">
        <p>Appraisal not found or user not logged in.</p>
        <button onClick={onBack} className="mt-4 text-zankli-orange-700">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <button
          onClick={() => {
            if (appraisal) {
              downloadAsPdf(pdfId, `Appraisal-${appraisal.employee_name}-${appraisal.id}`, logout);
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-zankli-orange-600 text-white font-semibold rounded-lg hover:bg-zankli-orange-700 transition-colors shadow-sm"
        >
          <Download size={16} /> Download as PDF
        </button>
      </div>

      <div id={pdfId} className="bg-white p-6 md:p-10 rounded-xl shadow-md">
        <header className="text-center border-b-2 border-gray-100 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Performance Appraisal</h1>
            <p className="text-lg text-gray-500 mt-1">Zankli Medical Centre</p>
        </header>

        <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm">
                    <p className="text-gray-500">Employee</p>
                    <p className="font-semibold text-gray-800 text-base">{appraisal.employee_name}</p>
                </div>
                <div className="text-sm">
                    <p className="text-gray-500">Department</p>
                    <p className="font-semibold text-gray-800 text-base">{appraisal.department}</p>
                </div>
                <div className="text-sm">
                    <p className="text-gray-500">Overall Score</p>
                    <p className="font-bold text-gray-800 text-2xl">{appraisal.overall_score.toFixed(2)}%</p>
                </div>
                 <div className="text-sm">
                    <p className="text-gray-500">Rating</p>
                    <p className="font-bold text-zankli-orange-700 text-2xl">{appraisal.overall_rating}</p>
                </div>
                 <div className="text-sm col-span-2 md:col-span-4">
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold text-gray-800 text-base">{appraisal.status}</p>
                </div>
            </div>
        </section>

        <section className="space-y-6 mb-8">
            {APPRAISAL_SECTIONS.map((section) => (
                <div key={section.title}>
                    <h3 className="text-lg font-semibold text-gray-700 bg-gray-100 p-3 rounded-t-lg border-b border-gray-200">{section.title}</h3>
                    <ul className="border border-t-0 border-gray-200 rounded-b-lg">
                        {section.questions.map((q, index) => (
                            <li key={q} className={`flex justify-between items-center p-3 ${index % 2 !== 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                <span className="text-sm text-gray-600 flex-1 pr-4">{QUESTION_LABELS[q]}</span>
                                <span className="font-bold text-lg text-zankli-orange-700 bg-zankli-orange-100 rounded-full h-8 w-8 flex items-center justify-center">{appraisal.scores[q]}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </section>

        <section className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Appraiser's Attestation</h2>
            <div className="space-y-4">
                 <div>
                    <p className="font-semibold text-gray-600">Overall Comments by {appraisal.hod_name}:</p>
                    <blockquote className="text-gray-700 italic border-l-4 border-zankli-orange-200 pl-4 py-2 mt-1">"{appraisal.comments || "No comments provided."}"</blockquote>
                </div>
                <div>
                    <p className="font-semibold text-gray-600">HOD Signature:</p>
                    {appraisal.hod_signature_url ? (
                        <img src={appraisal.hod_signature_url} alt="HOD Signature" className="mt-1 border rounded-lg h-24 w-auto bg-white p-2 shadow-sm" />
                    ) : (
                        <p className="text-sm text-gray-500">No signature provided.</p>
                    )}
                </div>
            </div>
        </section>

        <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Approval History</h2>
            {appraisal.signatures.length > 0 ? (
                <div className="space-y-4">
                    {appraisal.signatures.map(sig => (
                        <div key={sig.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                            <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{sig.profiles?.full_name} <span className="text-sm font-normal text-gray-500">({sig.profiles?.role ? ROLE_NAMES[sig.profiles.role] : '...'})</span></p>
                                {sig.comment && <blockquote className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3 my-2">"{sig.comment}"</blockquote>}
                                {/* The signature image has been removed from the trail as requested to fix display issues. */}
                                <p className="text-xs text-gray-400 mt-2">{new Date(sig.signed_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center">No approvals yet. Awaiting first review.</p>}
        </section>
      </div>

      {canApprove && appraisal.status !== AppraisalStatus.COMPLETED && (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border-t-4 border-zankli-orange-500">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3"><Edit size={20} /> Your Action Required</h2>
            <p className="text-sm text-gray-600">Please provide your comments (optional) and signature to proceed with the appraisal.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><MessageSquare size={16}/> Add a comment (optional)</label>
                    <textarea
                        id="comment"
                        rows={5}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        className="w-full h-32 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-zankli-orange-500 focus:border-transparent"
                        placeholder={`Comment as ${profile.full_name}...`}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Signature (Required)</label>
                    <SignaturePad ref={signaturePadRef} onEnd={setApproverSignature} />
                    <button type="button" onClick={clearSignature} className="text-sm text-zankli-orange-600 hover:underline mt-1">Clear Signature</button>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium py-2">{error}</p>}

            <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-zankli-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-zankli-orange-700 transition-all transform hover:scale-105 disabled:bg-zankli-orange-400 disabled:cursor-wait"
                >
                    {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                    {isSubmitting ? 'Submitting...' : 'Approve & Send to Next Level'}
                </button>
            </div>
        </div>
      )}
      <style>{`
        .touch-none {
          touch-action: none;
        }
      `}</style>
    </div>
  );
};

export default AppraisalView;
