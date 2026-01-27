import { supabase } from '../lib/supabase';
import { AttendanceSession, ClassSession } from '../types/attendance';
import { BaseClass } from '../types/class';
import { BaseSubject } from '../types/subject';
import { BaseUser } from '../types/user';

export const teacherService = {
  /**
   * NEW: Fetches the roster for a specific class ID.
   * Includes local_student_id (optional in BaseUser) for BLE matching.
   */
  async getStudentsByClass(classId: string): Promise<BaseUser[]> {
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('class_users')
      .select(
        `
        local_student_id,
        users!inner (
          id,
          name,
          profiles (
            avatar_url
          )
        )
      `,
      )
      .eq('class_id', classId)
      .eq('users.role', 'student');

    if (error) {
      console.error('TeacherService Roster Error:', error.message);
      throw new Error('FAILED_TO_FETCH_CLASS_ROSTER');
    }

    return (data as any[]).map(item => ({
      id: item.users.id,
      name: item.users.name,
      avatarUrl: item.users.profiles?.avatar_url || null,
      role: 'student',
      local_student_id: item.local_student_id, // Map the join table ID here
    }));
  },
  /**
   * Fetches all unique students (as BaseUsers) enrolled in any class taught by the teacher
   */
  async getEnrolledStudents(teacherId: string): Promise<BaseUser[]> {
    // 1. Get Class IDs for this teacher
    const { data: classes, error: classError } = await (supabase as any)
      .schema('test')
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId);

    if (classError) throw classError;
    if (!classes || classes.length === 0) return [];

    const classIds = classes.map(c => c.id);

    // 2. Optimized Fetch: Only grabbing essential UI fields
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('class_users')
      .select(
        `
        users!inner (
          id,
          name,
          short_
          profiles (
            avatar_url
          )
        )
      `,
      )
      .in('class_id', classIds)
      .eq('users.role', 'student');

    if (error) {
      console.error('TeacherService Error:', error.message);
      throw new Error('FAILED_TO_FETCH_STUDENTS');
    }

    // 3. Mapping to BaseUser interface
    const rawUsers: BaseUser[] = (data as any[]).map(item => ({
      id: item.users.id,
      name: item.users.name,
      avatarUrl: item.users.profiles?.avatar_url || null,
      role: 'student',
    }));

    // Deduplicate and return
    return Array.from(new Map(rawUsers.map(u => [u.id, u])).values());
  },
  async getTeacherClasses(teacherId: string): Promise<BaseClass[]> {
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('classes')
      .select('id, name, section') // Corrected column name
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('TeacherService Classes Error:', error.message);
      throw new Error('FAILED_TO_FETCH_CLASSES');
    }

    return (data as any[]).map(item => ({
      id: item.id,
      name: item.name || 'Untitled Class',
      section: item.section || 'N/A', // Mapping section here
    }));
  },
  /**
   * Fetches unique subjects based on the classes taught by this teacher
   */
  async getTeacherSubjects(teacherId: string): Promise<BaseSubject[]> {
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('classes')
      .select(
        `
        subjects!inner (
          id,
          name,
          code
        )
      `,
      )
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('TeacherService Subjects Error:', error.message);
      throw new Error('FAILED_TO_FETCH_SUBJECTS');
    }

    // Map and Deduplicate (since a teacher might teach multiple classes of the same subject)
    const rawSubjects: BaseSubject[] = (data as any[]).map(item => ({
      id: item.subjects.id,
      name: item.subjects.name,
      code: item.subjects.code || '',
    }));

    return Array.from(new Map(rawSubjects.map(s => [s.id, s])).values());
  },

  async getTodaysClasses(teacherId: string): Promise<ClassSession[]> {
    const jsDay = new Date().getDay();
    const dayOfWeek = jsDay === 0 ? 7 : jsDay;
    console.log(dayOfWeek);

    const { data, error } = await supabase
      .schema('test')
      .from('classes')
      .select(
        `
      *,
      subjects (name, code)
    `,
      )
      .eq('teacher_id', teacherId)
      .eq('day_of_week', dayOfWeek);

    if (error) throw error;
    return data as ClassSession[];
  },
  async finalizeAttendanceSession(
    classId: string,
    teacherId: string,
    capturedStudents: any[],
  ) {
    // 1. Create the Attendance Session
    const { data: session, error: sessionError } = await (supabase as any)
      .schema('test')
      .from('attendance_sessions')
      .insert([
        {
          class_id: classId,
          started_by: teacherId,
          session_nonce: Math.random().toString(36).substring(7), // Random nonce for now
        },
      ])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // 2. Prepare bulk records for the students
    // We use the user_uuid we stored in the captured list
    const records = capturedStudents.map(student => ({
      attendance_session_id: session.id,
      user_id: student.user_uuid,
    }));

    if (records.length === 0) return session; // No students found

    // 3. Bulk insert attendance records
    const { error: recordsError } = await (supabase as any)
      .schema('test')
      .from('attendance_records')
      .insert(records);

    if (recordsError) {
      console.error('Error saving records:', recordsError.message);
      throw new Error('FAILED_TO_SAVE_RECORDS');
    }

    return session;
  },

  async getSessionsByTeacherId(
    teacherId: string,
  ): Promise<AttendanceSession[]> {
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('attendance_sessions')
      .select('id, class_id, started_by, session_nonce, started_at')
      .eq('started_by', teacherId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('❌ Fetch Error:', error.message);
      throw error;
    }

    return data as AttendanceSession[];
  },
};
