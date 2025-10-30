
import React from 'react';
import { AppraisalWithSignatures } from '../types';
import { APPRAISAL_SECTIONS, QUESTION_LABELS, ROLE_NAMES } from '../constants';
import { CheckCircle } from 'lucide-react';

interface PrintableAppraisalViewProps {
  appraisal: AppraisalWithSignatures;
  isLast: boolean;
}

const PrintableAppraisalView: React.FC<PrintableAppraisalViewProps> = ({ appraisal, isLast }) => {
  return (
    <div style={{ pageBreakAfter: isLast ? 'auto' : 'always' }} className="p-8 font-sans text-gray-800">
      <div className="bg-white">
        <header className="text-center border-b-2 border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Performance Appraisal</h1>
          <p className="text-gray-500">Zankli Medical Centre</p>
        </header>

        <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
            <div><strong>Employee:</strong><p>{appraisal.employee_name}</p></div>
            <div><strong>Department:</strong><p>{appraisal.department}</p></div>
            <div><strong>Appraisal ID:</strong><p>{appraisal.id}</p></div>
            <div><strong>Status:</strong><p className="font-semibold text-zankli-orange-800">{appraisal.status}</p></div>
            <div><strong>Overall Score:</strong><p className="text-xl font-bold">{appraisal.overall_score.toFixed(2)}%</p></div>
            <div><strong>Rating:</strong><p className="text-xl font-bold">{appraisal.overall_rating}</p></div>
        </div>

        <div className="space-y-6 mb-6">
            {APPRAISAL_SECTIONS.map(section => (
                <div key={section.title}>
                    <h2 className="text-lg font-semibold text-gray-700 bg-zankli-cream-200 p-2 rounded-t-md">{section.title}</h2>
                    <ul className="border rounded-b-md">
                        {section.questions.map(q => (
                            <li key={q} className="flex justify-between items-center p-2 border-b last:border-b-0">
                                <span className="text-sm text-gray-600">{QUESTION_LABELS[q]}</span>
                                <span className="font-bold text-lg text-zankli-orange-700">{appraisal.scores[q]}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        
        <div className="mb-6" style={{ breakInside: 'avoid' }}>
            <h2 className="text-lg font-semibold text-gray-700">Appraiser's Attestation</h2>
            <div className="p-4 bg-gray-50 rounded-md mt-2 space-y-4">
                <div>
                    <p className="font-semibold">HOD Name:</p>
                    <p className="text-gray-700">{appraisal.hod_name}</p>
                </div>
                <div>
                    <p className="font-semibold">HOD Signature:</p>
                    {appraisal.hod_signature_url ? (
                        <img src={appraisal.hod_signature_url} alt="HOD Signature" className="mt-1 border rounded-md h-20 w-auto bg-white p-1" />
                    ) : (
                        <p className="text-sm text-gray-500">No signature provided.</p>
                    )}
                </div>
                 <div>
                    <p className="font-semibold">Overall Comments:</p>
                    <p className="text-gray-700 italic">"{appraisal.comments || "No comments provided."}"</p>
                </div>
            </div>
        </div>

        <div style={{ breakInside: 'avoid' }}>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Approval History</h2>
            {appraisal.signatures.length > 0 ? (
                <div className="space-y-4">
                    {appraisal.signatures.map(sig => (
                        <div key={sig.id} className="flex items-start gap-3 p-3 bg-zankli-cream-100 rounded-md">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold">{sig.profiles?.full_name} <span className="text-sm font-normal text-gray-500">({sig.profiles?.role ? ROLE_NAMES[sig.profiles.role] : '...'})</span></p>
                                {sig.comment && <p className="text-sm text-gray-600 italic">"{sig.comment}"</p>}
                                <p className="text-xs text-gray-400">{new Date(sig.signed_at).toLocaleString()}</p>
                                {sig.signature_url && (
                                    <div className="mt-2">
                                        <p className="text-xs font-semibold text-gray-500">Signature:</p>
                                        <img src={sig.signature_url} alt={`${sig.profiles?.full_name}'s signature`} className="mt-1 border rounded-md h-16 w-auto bg-white p-1" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-gray-500">No approvals yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default PrintableAppraisalView;