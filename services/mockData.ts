import { CourtCase, CaseType } from '../types';

const CASE_TYPES: CaseType[] = ['Civil', 'Criminal', 'Family', 'Traffic', 'Consumer'];

export const generateRandomCase = (id: number): CourtCase => {
  const caseType = CASE_TYPES[Math.floor(Math.random() * CASE_TYPES.length)];
  const filingYear = Math.floor(Math.random() * (2025 - 2018 + 1)) + 2018;
  
  return {
    case_id: `CASE-${2025}-${id.toString().padStart(4, '0')}`,
    case_type: caseType,
    filing_year: filingYear,
    case_age_days: Math.floor(Math.random() * 2450) + 50,
    claim_amount: Math.floor(Math.random() * 999000) + 1000,
    previous_adjournments: Math.floor(Math.random() * 16),
    lawyer_experience_years: Math.floor(Math.random() * 36),
    lawyer_reliability: parseFloat((Math.random() * (0.95 - 0.3) + 0.3).toFixed(2)),
    opposing_lawyer_reliability: parseFloat((Math.random() * (0.95 - 0.3) + 0.3).toFixed(2)),
    witness_required: Math.random() > 0.5,
    police_report_pending: Math.random() > 0.7, // 30% chance pending
    document_completeness: parseFloat((Math.random() * (1.0 - 0.4) + 0.4).toFixed(2)),
    court_workload_today: Math.floor(Math.random() * 100) + 20,
  };
};

export const generateDataset = (count: number = 500): CourtCase[] => {
  return Array.from({ length: count }, (_, i) => generateRandomCase(i + 1));
};