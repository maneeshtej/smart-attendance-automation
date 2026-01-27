import { supabase } from '../lib/supabase';
import { BaseClass } from '../types/class';
import { BaseSubject } from '../types/subject';
import { BaseUser } from '../types/user';

export const studentService = {
  /**
   * Fetches all unique teachers of the classes the student is enrolled in
   */
  async getMyTeachers(studentId: string): Promise<BaseUser[]> {
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('class_users')
      .select(
        `
        classes!inner (
          users!inner (
            id,
            name,
            profiles (
              avatar_url
            )
          )
        )
      `,
      )
      .eq('user_id', studentId);

    if (error) {
      console.error('StudentService Teachers Error:', error.message);
      throw new Error('FAILED_TO_FETCH_TEACHERS');
    }

    const rawTeachers: BaseUser[] = (data as any[]).map(item => ({
      id: item.classes.users.id,
      name: item.classes.users.name,
      avatarUrl: item.classes.users.profiles?.avatar_url || null,
      role: 'teacher',
    }));

    // Deduplicate (in case a student has one teacher for multiple classes)
    return Array.from(new Map(rawTeachers.map(u => [u.id, u])).values());
  },

  /**
   * Fetches all classes the student is enrolled in
   */
  async getStudentClasses(studentId: string): Promise<BaseClass[]> {
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('class_users')
      .select(
        `
        classes!inner (
          id,
          name,
          section
        )
      `,
      )
      .eq('user_id', studentId);

    if (error) {
      console.error('StudentService Classes Error:', error.message);
      throw new Error('FAILED_TO_FETCH_CLASSES');
    }

    return (data as any[]).map(item => ({
      id: item.classes.id,
      name: item.classes.name || 'Untitled Class',
      section: item.classes.section || 'N/A',
    }));
  },

  /**
   * Fetches all subjects the student is studying based on class enrollments
   */
  async getStudentSubjects(studentId: string): Promise<BaseSubject[]> {
    const { data, error } = await (supabase as any)
      .schema('test')
      .from('class_users')
      .select(
        `
        classes!inner (
          subjects!inner (
            id,
            name,
            code
          )
        )
      `,
      )
      .eq('user_id', studentId);

    if (error) {
      console.error('StudentService Subjects Error:', error.message);
      throw new Error('FAILED_TO_FETCH_SUBJECTS');
    }

    const rawSubjects: BaseSubject[] = (data as any[]).map(item => ({
      id: item.classes.subjects.id,
      name: item.classes.subjects.name,
      code: item.classes.subjects.code || '',
    }));

    // Deduplicate
    return Array.from(new Map(rawSubjects.map(s => [s.id, s])).values());
  },

  async verifyAndGetClassDetails(userId: string, shortIdFromBle: string) {
    const { data: enrollment, error: enrollError } = await (supabase as any)
      .schema('test')
      .from('class_users')
      .select(
        `
        local_student_id,
        classes!inner (
          id,
          name,
          short_class_id,
          subjects!inner (
            name,
            code
          ),
          users!classes_teacher_id_fkey (
            name
          )
        )
      `,
      )
      .eq('user_id', userId)
      .eq('classes.short_class_id', parseInt(shortIdFromBle))
      .single();

    if (enrollError) {
      console.error('❌ Enrollment check failed:', enrollError.message);
      return null;
    }

    // Map the nested join data to a clean object for the UI
    return {
      localStudentId: enrollment.local_student_id,
      classId: enrollment.classes.id,
      className: enrollment.classes.name,
      subjectName: enrollment.classes.subjects?.name,
      subjectCode: enrollment.classes.subjects?.code,
      teacherName: enrollment.classes.users?.name,
    };
  },
};
