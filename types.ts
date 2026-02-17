export type CaseType = 'Civil' | 'Criminal' | 'Family' | 'Traffic' | 'Consumer';

export interface CourtCase {
  case_id: string;
  case_type: CaseType;
  filing_year: number;
  case_age_days: number;
  claim_amount: number;
  previous_adjournments: number;
  lawyer_experience_years: number;
  lawyer_reliability: number; // 0.0 to 1.0
  opposing_lawyer_reliability: number; // 0.0 to 1.0
  witness_required: boolean;
  police_report_pending: boolean;
  document_completeness: number; // 0.0 to 1.0
  court_workload_today: number;
  
  // ML Inputs/Outputs
  settlement_possible?: boolean;
  settlement_prob?: number;
  likely_delay?: boolean;
  delay_prob?: number;
  estimated_hearing_minutes?: number;
  priority_score?: number;
}

export interface ScheduleSlot {
  time: string;
  case_id: string;
  case_type: string;
  duration: number;
  priority_score: number;
  status: 'Scheduled' | 'Buffer' | 'Break';
  risk_flag: boolean; // if high delay probability
}

export interface DashboardStats {
  totalCases: number;
  divertedToMediation: number;
  hearingsSaved: number;
  avgDelayReduction: number;
}