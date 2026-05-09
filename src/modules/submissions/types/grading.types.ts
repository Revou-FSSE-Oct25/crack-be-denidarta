/** Shape of each item inside `Assignment.gradingCriteria` (Json field). */
export interface GradingCriteriaItem {
  label: string;
  description?: string;
  points: number;
}

/** Shape of each item inside `AssignmentSubmission.criteriaScores` (Json field). */
export interface CriteriaScoreItem {
  /** Zero-based index referencing the position in `Assignment.gradingCriteria`. */
  criteriaIndex: number;
  checked: boolean;
  pointsAwarded: number;
  notes?: string;
}
