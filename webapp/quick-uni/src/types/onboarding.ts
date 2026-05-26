export interface OnboardingRow {
  data: Record<string, unknown>;
  errors: string[];
  isValid: boolean;
  processed?: boolean;
  error?: string;
}

export interface OnboardingSummary {
  total: number;
  valid: number;
  error: number;
  results: OnboardingRow[];
  success?: number;
  failed?: number;
  currentProcessed?: number;
  executionResults?: OnboardingRow[];
}
