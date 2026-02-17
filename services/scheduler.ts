import { CourtCase, ScheduleSlot } from '../types';

/**
 * Calculates priority score based on:
 * (case_age_days * 0.4) + ((1 - delay_probability) * 0.3) + ...
 */
export const calculatePriority = (c: CourtCase): number => {
  const ageScore = (c.case_age_days / 2500); // Normalize age 0-1
  const urgencyMultiplier = (c.case_type === 'Criminal' || c.case_type === 'Family') ? 1 : 0.5;
  const delayProb = c.delay_prob || 0.5;

  // Formula from prompt
  const score = 
    (ageScore * 0.4) + 
    ((1 - delayProb) * 0.3) + 
    (c.document_completeness * 0.2) + 
    (urgencyMultiplier * 0.1);
  
  return parseFloat(score.toFixed(3));
};

export const generateSchedule = (cases: CourtCase[]): ScheduleSlot[] => {
  // 1. Enrich and Filter
  // Remove settlement cases from court schedule (they go to mediation)
  const courtCases = cases
    .filter(c => !c.settlement_possible)
    .map(c => ({...c, priority_score: calculatePriority(c)}));

  // 2. Sort by Priority (High to Low)
  courtCases.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  // 3. Time Slots Setup
  // 9:30 AM starts
  let currentMinutes = 9 * 60 + 30; 
  const endMinutes = 16 * 60 + 30; // 4:30 PM
  const lunchStart = 13 * 60; // 1:00 PM
  const lunchEnd = 14 * 60; // 2:00 PM

  const schedule: ScheduleSlot[] = [];

  for (const c of courtCases) {
    if (currentMinutes >= endMinutes) break;

    // Check Lunch Break
    if (currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
      schedule.push({
        time: minutesToTime(currentMinutes),
        case_id: "LUNCH_BREAK",
        case_type: "Break",
        duration: 60,
        priority_score: 0,
        status: "Break",
        risk_flag: false
      });
      currentMinutes = lunchEnd;
    }

    const duration = c.estimated_hearing_minutes || 15;
    
    // Add Case
    schedule.push({
      time: minutesToTime(currentMinutes),
      case_id: c.case_id,
      case_type: c.case_type,
      duration: duration,
      priority_score: c.priority_score || 0,
      status: 'Scheduled',
      risk_flag: c.likely_delay || false
    });

    currentMinutes += duration;

    // Add Buffer if High Risk
    if (c.likely_delay) {
       // 5 min buffer
       if (currentMinutes < lunchStart || currentMinutes >= lunchEnd) {
         currentMinutes += 5; 
       }
    }
  }

  return schedule;
};

const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export const generateMediationAgreement = (c: CourtCase): string => {
  return `MEDIATION AGREEMENT

CASE ID: ${c.case_id}
TYPE: ${c.case_type}
DATE: ${new Date().toLocaleDateString()}

PARTIES:
Plaintiff vs. Defendant (Represented by respective counsel)

TERMS OF SETTLEMENT:
1. The parties agree to settle the dispute regarding the claim of ₹${c.claim_amount.toLocaleString()}.
2. Based on the document completeness score of ${Math.round(c.document_completeness * 100)}%, both parties acknowledge the validity of core evidence.
3. To avoid the predicted ${c.likely_delay ? 'High' : 'Moderate'} risk of litigation delay and associated legal costs.
4. This settlement is final and binding, removing the need for further court hearings.

Signed,
[Mediator Signature]
[Party A Signature]
[Party B Signature]
`;
};