// Hand-typed minimal DB types for Phase 1.
// Replace later with `supabase gen types typescript --linked > database.types.ts`.

export type DayType =
  | 'push' | 'pull' | 'legs'
  | 'bjj' | 'cardio' | 'rest'
  | 'taper_light' | 'comp';

export type Phase = 'accumulation' | 'deload' | 'intensification' | 'taper';

export type SessionKind = 'lift' | 'bjj' | 'cardio';

export type GiType = 'gi' | 'no_gi';

export type CardioKind =
  | 'incline_walk' | 'assault_bike' | 'run' | 'row' | 'other';

export interface ProgramDay {
  id: string;
  program_id: string;
  user_id: string;
  date: string;
  week_number: number;
  phase: Phase;
  day_type: DayType;
  notes: string | null;
}

export interface PrescribedExercise {
  id: string;
  program_day_id: string;
  user_id: string;
  order_index: number;
  name: string;
  sets: number;
  rep_scheme: string;
  rpe_target: string | null;
  notes: string | null;
}

export interface SessionLog {
  id: string;
  user_id: string;
  program_day_id: string | null;
  kind: SessionKind;
  performed_at: string;
  duration_minutes: number | null;
  rpe: number | null;
  notes: string | null;
  created_at: string;
}

export interface ExerciseLog {
  id: string;
  session_log_id: string;
  user_id: string;
  prescribed_exercise_id: string | null;
  exercise_name: string;
  set_number: number;
  reps: number | null;
  weight_lbs: number | null;
  rpe: number | null;
  notes: string | null;
}

export interface BjjSession {
  id: string;
  user_id: string;
  session_log_id: string | null;
  date: string;
  duration_minutes: number | null;
  gi: GiType;
  technique_focus: string | null;
  num_rolls: number | null;
  taps_given: number | null;
  taps_received: number | null;
  rpe: number | null;
  notes: string | null;
  orb_summary: string | null;
}

export interface CardioSession {
  id: string;
  user_id: string;
  session_log_id: string | null;
  date: string;
  cardio_type: CardioKind;
  duration_minutes: number | null;
  distance_miles: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  calories: number | null;
  rpe: number | null;
  source: string;
  garmin_activity_id: string | null;
  notes: string | null;
}

export interface BodyMetric {
  id: string;
  user_id: string;
  date: string;
  weight_lbs: number | null;
  body_fat_pct: number | null;
  muscle_pct: number | null;
  water_pct: number | null;
  notes: string | null;
}

export interface Program {
  id: string;
  user_id: string;
  name: string;
  competition_date: string | null;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
}

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  bjj: 'BJJ',
  cardio: 'Cardio',
  rest: 'Rest',
  taper_light: 'Taper Light',
  comp: 'Competition',
};

export const PHASE_LABEL: Record<Phase, string> = {
  accumulation: 'Accumulation',
  deload: 'Deload',
  intensification: 'Intensification',
  taper: 'Taper',
};

export function isLiftDay(d: DayType): boolean {
  return d === 'push' || d === 'pull' || d === 'legs' || d === 'taper_light';
}
