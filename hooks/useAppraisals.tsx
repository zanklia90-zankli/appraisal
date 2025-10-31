import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Appraisal, AppraisalStatus, Signature, UserRole, Profile, AppraisalWithSignatures } from '../types';
import { NEXT_STATUS } from '../constants';
import { calculateScores, getScoreLegend, dataUrlToBlob } from '../utils/helpers';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './useAuth';

// FIX: Omit 'hod_signature_url' as it is generated within addAppraisal from the signatureDataUrl, not passed in.
type NewAppraisalData = Omit<Appraisal, 'id' | 'status' | 'created_at' | 'overall_score' | 'overall_rating' | 'hod_signature_url'>;

interface AppraisalContextType {
  appraisals: Appraisal[];
  loading: boolean;
  addAppraisal: (appraisalData: NewAppraisalData, signatureDataUrl: string) => Promise<void>;
  approveAppraisal: (appraisalId: string, currentStatus: AppraisalStatus, signatureDataUrl: string, comment?: string) => Promise<void>;
  getAppraisalDetails: (id: string) => Promise<AppraisalWithSignatures | null>;
}

const AppraisalContext = createContext<AppraisalContextType | undefined>(undefined);

export const AppraisalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAppraisals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appraisals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching appraisals:", error);
      setAppraisals([]);
    } else {
      setAppraisals(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchAppraisals();
    } else {
      setAppraisals([]);
      setLoading(false);
    }
  }, [user, fetchAppraisals]);
  
  const addAppraisal = useCallback(async (appraisalData: NewAppraisalData, signatureDataUrl: string) => {
      if (!user) throw new Error("User not authenticated");

      const signatureBlob = dataUrlToBlob(signatureDataUrl);
      const filePath = `${user.id}-${Date.now()}.png`;

      // 1. Upload signature
      const { data: uploadData, error: uploadError } = await supabase.storage
          .from('signatures')
          .upload(filePath, signatureBlob);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage
          .from('signatures')
          .getPublicUrl(uploadData.path);
          
      // 3. Calculate scores
      const { average, percentage } = calculateScores(appraisalData.scores);
      const overallRating = getScoreLegend(average);
      
      // 4. Insert appraisal
      const newAppraisalRecord = {
          ...appraisalData,
          hod_signature_url: urlData.publicUrl,
          status: AppraisalStatus.PENDING_HR_APPROVAL,
          overall_score: percentage,
          overall_rating: overallRating,
      };

      const { error: insertError } = await supabase.from('appraisals').insert([newAppraisalRecord]);

      if (insertError) {
        if (insertError.message.includes('violates row-level security policy')) {
            const helpfulMessage = `Database security policy prevented this submission. Please ensure an 'INSERT' policy exists on the 'appraisals' table that allows users with the role '${UserRole.APPRAISER}' to create records.`;
            throw new Error(helpfulMessage);
        }
        throw insertError;
      }
      
      // 5. Refresh list
      await fetchAppraisals();

  }, [user, fetchAppraisals]);

  const approveAppraisal = useCallback(async (appraisalId: string, currentStatus: AppraisalStatus, signatureDataUrl: string, comment?: string) => {
     if (!user) throw new Error("User not authenticated");

     try {
        const signatureBlob = dataUrlToBlob(signatureDataUrl);
        const filePath = `${user.id}-approval-${Date.now()}.png`;

        // 1. Upload signature
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('signatures')
            .upload(filePath, signatureBlob);
        
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('signatures')
            .getPublicUrl(uploadData.path);
        
        // 2. Create signature record
        const newSignature = {
           appraisal_id: appraisalId,
           signer_id: user.id,
           comment: comment,
           signature_url: urlData.publicUrl,
        };

        const { error: signatureError } = await supabase.from('signatures').insert([newSignature]);
        if (signatureError) throw signatureError;

        // 3. Update appraisal status
        const newStatus = NEXT_STATUS[currentStatus];
        
        console.log('Attempting to update appraisal:', {
            id: appraisalId,
            fromStatus: currentStatus,
            toStatus: newStatus,
        });

        const { error: appraisalUpdateError } = await supabase
           .from('appraisals')
           .update({ status: newStatus })
           .eq('id', appraisalId);
        
        if (appraisalUpdateError) {
            throw appraisalUpdateError;
        }

        // 4. Refresh list
        await fetchAppraisals();
     } catch (error: any) {
        if (error.message && error.message.includes('violates row-level security policy')) {
            const newStatus = NEXT_STATUS[currentStatus];
            const helpfulMessage = `Database security policy prevented this update. Please check the 'UPDATE' Row Level Security policy on your 'appraisals' table in Supabase. For this approval to work, the policy's 'USING' clause must allow you to select the row with status '${currentStatus}', and the 'WITH CHECK' clause must allow the row to be changed to status '${newStatus}'.`;
            throw new Error(helpfulMessage);
        }
        throw error;
     }
  }, [user, fetchAppraisals]);

  const getAppraisalDetails = useCallback(async (id: string): Promise<AppraisalWithSignatures | null> => {
    // Fetch appraisal and signatures in separate steps for robustness and better error handling.
    // This prevents the entire query from failing due to RLS on joined tables like 'profiles'.

    // Step 1: Fetch the main appraisal data.
    const { data: appraisalData, error: appraisalError } = await supabase
      .from('appraisals')
      .select('*')
      .eq('id', id)
      .single();

    if (appraisalError) {
      console.error("Error fetching appraisal:", appraisalError);
      return null;
    }

    // Step 2: Fetch the associated signatures.
    const { data: signaturesData, error: signaturesError } = await supabase
        .from('signatures')
        .select('*')
        .eq('appraisal_id', id)
        .order('signed_at', { ascending: true });

    if (signaturesError) {
        console.error("Error fetching signatures:", signaturesError);
        // We can still return the appraisal, just without signatures.
        return { ...appraisalData, signatures: [] };
    }

    // Initialize appraisal with signatures (profiles will be added next)
    const appraisalWithSignatures: AppraisalWithSignatures = {
        ...appraisalData,
        signatures: signaturesData.map(s => ({ ...s, profiles: null })), // Set profiles to null initially
    };

    // Step 3: Fetch profiles for all unique signers.
    if (signaturesData && signaturesData.length > 0) {
        const signerIds = signaturesData.map((sig) => sig.signer_id);
        const uniqueSignerIds = [...new Set(signerIds)];

        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', uniqueSignerIds);

        if (profilesError) {
            console.error("Error fetching signer profiles:", profilesError);
            // If profiles fail, we still have the signatures. The UI will handle null profiles.
        } else if (profilesData) {
            // FIX: Supabase can return empty objects `{}` for rows that fail RLS policies.
            // We cast the data to an array of partial profiles to safely filter out
            // any objects that are missing an 'id', ensuring type safety downstream.
            const validProfiles = (profilesData as Array<Partial<Profile>>).filter(
                (p): p is Profile => !!p.id
            );
            const profilesMap = new Map(validProfiles.map((p) => [p.id, p]));
            
            // Attach profile data to each signature.
            appraisalWithSignatures.signatures.forEach((sig) => {
                sig.profiles = profilesMap.get(sig.signer_id) || null;
            });
        }
    }

    return appraisalWithSignatures;
  }, []);

  return (
    <AppraisalContext.Provider value={{ appraisals, loading, addAppraisal, approveAppraisal, getAppraisalDetails }}>
      {children}
    </AppraisalContext.Provider>
  );
};

export const useAppraisals = (): AppraisalContextType => {
  const context = useContext(AppraisalContext);
  if (context === undefined) {
    throw new Error('useAppraisals must be used within an AppraisalProvider');
  }
  return context;
};