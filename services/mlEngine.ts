import { CourtCase } from '../types';

/**
 * SIMULATED ML MODELS
 * In a real app, these would call the Python FastAPI endpoints which load .pkl files.
 * For this hackathon React demo, we implement the weighted logic directly.
 */

// Model A: Settlement Predictor
export const predictSettlement = (c: CourtCase): { possible: boolean; prob: number } => {
  let score = 0;
  
  // Feature weights
  if (['Civil', 'Consumer', 'Family'].includes(c.case_type)) score += 0.4;
  if (c.claim_amount < 500000) score += 0.2;
  if (c.document_completeness > 0.8) score += 0.2;
  if (c.previous_adjournments < 3) score += 0.1;
  
  // Negative weights
  if (c.case_type === 'Criminal' && c.police_report_pending) score -= 0.5;
  if (c.lawyer_reliability < 0.5) score -= 0.1;

  // Normalize sigmoid-ish
  const prob = Math.min(Math.max(score, 0.05), 0.95);
  return { possible: prob > 0.6, prob };
};

// Model B: Delay Predictor
export const predictDelay = (c: CourtCase): { likely: boolean; prob: number } => {
  let score = 0;

  if (c.witness_required) score += 0.3;
  if (c.lawyer_reliability < 0.6 || c.opposing_lawyer_reliability < 0.6) score += 0.3;
  if (c.previous_adjournments > 5) score += 0.2;
  if (c.police_report_pending) score += 0.4;
  if (c.document_completeness < 0.6) score += 0.2;

  const prob = Math.min(Math.max(score, 0.1), 0.99);
  return { likely: prob > 0.5, prob };
};

// Model C: Duration Regressor (Minutes)
export const predictDuration = (c: CourtCase): number => {
  let baseMinutes = 15;

  if (c.case_type === 'Criminal') baseMinutes += 20;
  if (c.case_type === 'Civil') baseMinutes += 10;
  if (c.witness_required) baseMinutes += 15;
  if (c.document_completeness < 0.5) baseMinutes += 10; // Time wasted reviewing messy docs
  
  // Cap between 5 and 60
  return Math.min(Math.max(baseMinutes, 5), 60);
};

// Orchestrator to enrich a case with AI predictions
export const analyzeCase = (c: CourtCase): CourtCase => {
  const settlement = predictSettlement(c);
  const delay = predictDelay(c);
  const duration = predictDuration(c);

  return {
    ...c,
    settlement_possible: settlement.possible,
    settlement_prob: settlement.prob,
    likely_delay: delay.likely,
    delay_prob: delay.prob,
    estimated_hearing_minutes: duration
  };
};