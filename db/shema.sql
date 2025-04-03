CREATE TABLE one_offs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    schedule_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_one_offs_schedule_date ON one_offs(schedule_date);


CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teaching_days TEXT[] NOT NULL,
  lesson_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (teaching_days <@ ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
);
CREATE INDEX idx_subjects_teaching_days ON subjects USING GIN (teaching_days);


CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_lesson_per_subject UNIQUE (subject_id, lesson_number)
);
CREATE INDEX idx_lessons_subject_id ON lessons(subject_id);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    event_type TEXT CHECK (event_type IN ('subject', 'one_off')),
    event_title TEXT NOT NULL,
    event_date DATE NOT NULL,
    daily_order_index INTEGER NOT NULL,
    event_parent_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_update_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_event_per_day UNIQUE (event_id, event_type, event_date)
);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_event_id_type ON events(event_id, event_type);
CREATE INDEX idx_events_event_parent_id ON events(event_parent_id);