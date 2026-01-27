create index idx_users_role on users(role);

create index idx_classes_teacher on classes(teacher_id);
create index idx_classes_subject on classes(subject_id);

create index idx_class_users_user on class_users(user_id);
create index idx_class_users_class on class_users(class_id);

create index idx_attendance_sessions_class
on attendance_sessions(class_id);

create index idx_attendance_sessions_started_by
on attendance_sessions(started_by);

create index idx_attendance_records_user
on attendance_records(user_id);

create index idx_attendance_records_session
on attendance_records(attendance_session_id);
