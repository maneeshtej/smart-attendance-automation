export interface Subject {
  code: string;
  name: string;
}

export interface ClassSession {
  id: string;
  name: string;
  short_class_id: number;
  start_time: string;
  end_time: string;
  section: string;
  day_of_week: number;
  subjects: Subject;
}

/**
 * STRICT: Matches test.attendance_sessions table
 */
export interface AttendanceSession {
  id: string; // uuid
  class_id: string; // uuid
  started_by: string; // uuid
  session_nonce: string; // text
  started_at: string; // timestamptz
}

/**
 * STRICT: Matches test.attendance_records table
 */
export interface AttendanceRecord {
  id: string; // uuid
  attendance_session_id: string; // uuid
  user_id: string; // uuid
  marked_at: string; // timestamptz
}
