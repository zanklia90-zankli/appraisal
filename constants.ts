
import { UserRole, Department, AppraisalSection, AppraisalStatus } from './types';

export const ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.APPRAISER]: 'Appraiser/HOD',
  [UserRole.HR]: 'Zankli HR',
  [UserRole.DOCS]: 'ZMC Docs',
  [UserRole.MD]: 'Managing Director',
  [UserRole.CHAIRMAN]: 'Chairman',
};

export const DEPARTMENTS = Object.values(Department);

export const APPRAISAL_SECTIONS: AppraisalSection[] = [
  {
    title: 'Job Knowledge & Skills',
    questions: [
      'q1_knowledge_of_duties',
      'q2_technical_skills',
      'q3_understanding_of_policies',
    ],
  },
  {
    title: 'Quality of Work',
    questions: [
      'q4_accuracy_and_thoroughness',
      'q5_efficiency_and_timeliness',
      'q6_work_presentation',
    ],
  },
  {
    title: 'Communication & Interpersonal Skills',
    questions: [
      'q7_teamwork_and_collaboration',
      'q8_patient_staff_interaction',
      'q9_clarity_of_communication',
    ],
  },
  {
    title: 'Attendance & Punctuality',
    questions: [
      'q10_punctuality',
      'q11_adherence_to_schedule',
    ],
  },
  {
    title: 'Initiative & Problem Solving',
    questions: [
      'q12_proactiveness',
      'q13_problem_solving_ability',
      'q14_adaptability_to_change',
    ]
  }
];

export const QUESTION_LABELS: Record<string, string> = {
  q1_knowledge_of_duties: 'Demonstrates thorough knowledge of job duties and responsibilities.',
  q2_technical_skills: 'Possesses the necessary technical skills to perform the job effectively.',
  q3_understanding_of_policies: 'Understands and follows hospital policies and procedures.',
  q4_accuracy_and_thoroughness: 'Produces accurate, thorough, and high-quality work.',
  q5_efficiency_and_timeliness: 'Completes tasks efficiently and within deadlines.',
  q6_work_presentation: 'Maintains a neat and organized work environment.',
  q7_teamwork_and_collaboration: 'Works cooperatively with others and contributes to a positive team environment.',
  q8_patient_staff_interaction: 'Interacts with patients and colleagues professionally and courteously.',
  q9_clarity_of_communication: 'Communicates clearly and effectively, both verbally and in writing.',
  q10_punctuality: 'Is consistently on time and ready to work at the start of their shift.',
  q11_adherence_to_schedule: 'Adheres to break and lunch schedules appropriately.',
  q12_proactiveness: 'Shows initiative and seeks out new responsibilities.',
  q13_problem_solving_ability: 'Identifies and resolves problems in a timely and effective manner.',
  q14_adaptability_to_change: 'Adapts well to changes in the work environment.',
};

export const WORKFLOW_ORDER: Record<AppraisalStatus, UserRole | null> = {
    [AppraisalStatus.DRAFT]: UserRole.APPRAISER,
    [AppraisalStatus.PENDING_HR_APPROVAL]: UserRole.HR,
    [AppraisalStatus.PENDING_DOCS_APPROVAL]: UserRole.DOCS,
    [AppraisalStatus.PENDING_MD_APPROVAL]: UserRole.MD,
    [AppraisalStatus.PENDING_CHAIRMAN_APPROVAL]: UserRole.CHAIRMAN,
    [AppraisalStatus.COMPLETED]: null,
};

export const NEXT_STATUS: Record<AppraisalStatus, AppraisalStatus> = {
    [AppraisalStatus.DRAFT]: AppraisalStatus.PENDING_HR_APPROVAL,
    [AppraisalStatus.PENDING_HR_APPROVAL]: AppraisalStatus.PENDING_DOCS_APPROVAL,
    [AppraisalStatus.PENDING_DOCS_APPROVAL]: AppraisalStatus.PENDING_MD_APPROVAL,
    [AppraisalStatus.PENDING_MD_APPROVAL]: AppraisalStatus.PENDING_CHAIRMAN_APPROVAL,
    [AppraisalStatus.PENDING_CHAIRMAN_APPROVAL]: AppraisalStatus.COMPLETED,
    [AppraisalStatus.COMPLETED]: AppraisalStatus.COMPLETED,
};