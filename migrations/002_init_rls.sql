-- Users can read their own row
create policy "users_read_self"
on users
for select
using (id = auth.uid());

-- Users can update their own profile (name only)
create policy "users_update_self"
on users
for update
using (id = auth.uid());

create policy "subjects_read_all"
on subjects
for select
using (true);

-- Teacher can read their own classes
create policy "classes_teacher_read"
on classes
for select
using (teacher_id = auth.uid());

-- Students can read classes they are enrolled in
create policy "classes_student_read"
on classes
for select
using (
  exists (
    select 1
    from class_users cu
    where cu.class_id = classes.id
      and cu.user_id = auth.uid()
  )
);

-- Teacher can create classes
create policy "classes_teacher_insert"
on classes
for insert
with check (teacher_id = auth.uid());

-- Students can read their own enrollments
create policy "class_users_read_self"
on class_users
for select
using (user_id = auth.uid());

-- Teacher can read enrollments of their class
create policy "class_users_teacher_read"
on class_users
for select
using (
  exists (
    select 1
    from classes c
    where c.id = class_users.class_id
      and c.teacher_id = auth.uid()
  )
);

-- Teacher can create attendance session for their class
create policy "attendance_sessions_teacher_insert"
on attendance_sessions
for insert
with check (
  exists (
    select 1
    from classes c
    where c.id = attendance_sessions.class_id
      and c.teacher_id = auth.uid()
  )
);

-- Teacher can read their sessions
create policy "attendance_sessions_teacher_read"
on attendance_sessions
for select
using (started_by = auth.uid());

-- Student can insert their own attendance
create policy "attendance_records_student_insert"
on attendance_records
for insert
with check (user_id = auth.uid());

-- Student can read their own attendance
create policy "attendance_records_student_read"
on attendance_records
for select
using (user_id = auth.uid());

-- Teacher can read attendance of their class
create policy "attendance_records_teacher_read"
on attendance_records
for select
using (
  exists (
    select 1
    from attendance_sessions s
    join classes c on c.id = s.class_id
    where s.id = attendance_records.attendance_session_id
      and c.teacher_id = auth.uid()
  )
);

