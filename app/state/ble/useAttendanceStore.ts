import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase/supabase';

interface AttendanceSession {
  id?: string;
  teacher_id: string;
  subject_name: string;
  total_present: number;
  created_at?: string;
  isSynced?: boolean;
}

interface AttendanceRecord {
  id?: string;
  session_id: string;
  student_id?: string;
  confirmed_at?: string;
  synced_online?: boolean;
  device_id: string;
}

interface AttendanceStore {
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
  currentSession: AttendanceSession | null;

  // session actions
  startSessionLocal: (teacherId: string, subject: string) => void;
  markSessionSynced: (sessionId: string) => void;
  fetchSessionsOnline: () => Promise<void>;
  deleteCurrentSession: () => void;
  deleteSessionById: (sessionId: string) => void;

  // record actions
  addRecordLocal: (studentId: string, deviceId?: string) => void;
  markRecordSynced: (recordId: string) => void;

  syncAllToSupabase: () => Promise<void>;
  clearAll: () => void;
  updateTotalPresent: (sessionId: string) => void;
  syncSessionWithRecords: (localSessionId: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      records: [],
      currentSession: null,

      // ✅ Create new session locally
      startSessionLocal: (teacherId, subject) => {
        const newSession: AttendanceSession = {
          id: `local-${Date.now()}`,
          teacher_id: teacherId,
          subject_name: subject,
          total_present: 0,
          created_at: new Date().toISOString(),
          isSynced: false,
        };
        set(state => ({
          currentSession: newSession,
          sessions: [...state.sessions, newSession],
        }));
      },

      markSessionSynced: sessionId => {
        set(state => ({
          sessions: state.sessions.map(s =>
            s.id === sessionId ? { ...s, isSynced: true } : s,
          ),
        }));
      },

      // ✅ Add record locally
      addRecordLocal: deviceId => {
        const { currentSession, updateTotalPresent } = get();
        if (!currentSession) return;

        const cleanDeviceId = deviceId?.match(/\d{3}/)?.[0] || deviceId;

        const newRecord: AttendanceRecord = {
          id: `local-${Date.now()}-${cleanDeviceId}`,
          session_id: currentSession.id!,
          student_id: undefined,
          device_id: cleanDeviceId,
          confirmed_at: new Date().toISOString(),
          synced_online: false,
        };

        set(state => ({
          records: [...state.records, newRecord],
        }));

        if (currentSession.id) updateTotalPresent(currentSession.id);
      },

      markRecordSynced: recordId => {
        set(state => ({
          records: state.records.map(r =>
            r.id === recordId ? { ...r, synced_online: true } : r,
          ),
        }));
      },

      // ✅ Fetch sessions from Supabase (optional)
      fetchSessionsOnline: async () => {
        const { data, error } = await supabase
          .from('attendance_sessions')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) set({ sessions: data });
      },

      // ✅ Upload unsynced local data to Supabase
      syncAllToSupabase: async () => {
        const { sessions, records, markSessionSynced, markRecordSynced } =
          get();

        const unsyncedSessions = sessions.filter(s => !s.isSynced);
        const unsyncedRecords = records.filter(r => !r.synced_online);

        try {
          // Insert unsynced sessions
          for (const session of unsyncedSessions) {
            const { data, error } = await supabase
              .from('attendance_sessions')
              .insert({
                teacher_id: session.teacher_id,
                subject_name: session.subject_name,
                total_present: session.total_present,
              })
              .select()
              .single();

            if (!error && data) {
              markSessionSynced(session.id!);
            }
          }

          // Insert unsynced records
          for (const rec of unsyncedRecords) {
            const { error } = await supabase.from('attendance_records').insert({
              session_id: rec.session_id.replace('local-', ''), // handle local id case
              student_id: rec.student_id,
              device_id: rec.device_id,
              confirmed_at: rec.confirmed_at,
            });
            if (!error) markRecordSynced(rec.id!);
          }

          console.log('✅ Synced all unsynced data');
        } catch (err) {
          console.error('❌ Sync error:', err);
        }
      },

      deleteCurrentSession: () => {
        const { currentSession, sessions, records } = get();
        if (!currentSession) return;

        // Remove session + its records
        const updatedSessions = sessions.filter(
          s => s.id !== currentSession.id,
        );
        const updatedRecords = records.filter(
          r => r.session_id !== currentSession.id,
        );

        set({
          currentSession: null,
          sessions: updatedSessions,
          records: updatedRecords,
        });

        console.log(
          `🗑️ Deleted session ${currentSession.id} and related records`,
        );
      },

      deleteSessionById: (sessionId: string) => {
        const { sessions, records } = get();
        set({
          sessions: sessions.filter(s => s.id !== sessionId),
          records: records.filter(r => r.session_id !== sessionId),
        });
      },

      updateTotalPresent: (sessionId: string) => {
        const { records, sessions, currentSession } = get();

        // Count how many records belong to this session
        const total = records.filter(r => r.session_id === sessionId).length;

        // Update in sessions array
        const updatedSessions = sessions.map(s =>
          s.id === sessionId ? { ...s, total_present: total } : s,
        );

        // Also update currentSession if it's the same
        const updatedCurrent =
          currentSession && currentSession.id === sessionId
            ? { ...currentSession, total_present: total }
            : currentSession;

        set({
          sessions: updatedSessions,
          currentSession: updatedCurrent,
        });

        console.log(
          `📊 Updated total_present = ${total} for session ${sessionId}`,
        );
      },

      syncSessionWithRecords: async localSessionId => {
        const { sessions, records, markSessionSynced, markRecordSynced } =
          get();

        console.log('Starting upload');

        // Find session by local ID
        const session = sessions.find(s => s.id === localSessionId);
        if (!session) {
          console.warn(`⚠️ No session found for local ID: ${localSessionId}`);
          return;
        }

        console.log('uploading sessions');

        // ✅ 1. Upload session first
        try {
          const { data: uploadedSession, error: sessionError } = await supabase
            .schema('test')
            .from('attendance_sessions')
            .insert({
              teacher_id: session.teacher_id,
              subject_name: session.subject_name,
              total_present: session.total_present,
              local_id: session.id,
            })
            .select()
            .single();

          if (sessionError) throw sessionError;
          if (!uploadedSession?.id)
            throw new Error('❌ Missing Supabase session ID');

          console.log(
            `✅ Uploaded session: ${uploadedSession.id} (local ${session.id})`,
          );

          console.log('uploading records');

          // ✅ 2. Upload all records belonging to that session
          const relatedRecords = records.filter(
            r => r.session_id === session.id,
          );

          for (const record of relatedRecords) {
            const { error: recordError } = await supabase
              .schema('test')
              .from('attendance_records')
              .insert({
                session_id: uploadedSession.id, // use Supabase ID now
                student_id: record.student_id,
                device_id: record.device_id,
                confirmed_at: record.confirmed_at,
                local_id: record.id,
              });

            if (recordError) {
              console.error(
                `❌ Record upload failed for ${record.id}:`,
                recordError,
              );
            } else {
              markRecordSynced(record.id!);
            }
          }

          console.log('marking sessions');

          // ✅ 3. Mark session synced
          markSessionSynced(session.id!);
          console.log(
            `✅ Synced session ${session.subject_name} and its records`,
          );
        } catch (err) {
          console.error(
            `❌ syncSessionWithRecords failed for ${localSessionId}:`,
            err,
          );
        }
      },

      clearAll: () => set({ sessions: [], records: [], currentSession: null }),
    }),
    {
      name: 'attendance-storage', // key for AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
