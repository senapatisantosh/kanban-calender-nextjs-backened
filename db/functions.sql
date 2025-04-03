CREATE OR REPLACE FUNCTION generate_lesson_schedule_dates(
    p_lesson_count INT,
    p_teaching_days TEXT[],       
    p_start_date DATE          
) RETURNS TABLE (lesson_number INT, schedule_date DATE) AS $$
DECLARE
    iso_days INT[];         
    next_date DATE;         
    counter INT := 1;       
BEGIN
    SELECT ARRAY(
        SELECT CASE 
            WHEN d = 'Mon' THEN 1
            WHEN d = 'Tue' THEN 2
            WHEN d = 'Wed' THEN 3
            WHEN d = 'Thu' THEN 4
            WHEN d = 'Fri' THEN 5
        END
        FROM unnest(p_teaching_days) AS d
    ) INTO iso_days;

    next_date := p_start_date;
    WHILE NOT EXTRACT(ISODOW FROM next_date) = ANY(iso_days) LOOP
        next_date := next_date + 1;
    END LOOP;

    WHILE counter <= p_lesson_count LOOP
        RETURN QUERY SELECT counter, next_date;
        
        LOOP
            next_date := next_date + 1;
            EXIT WHEN EXTRACT(ISODOW FROM next_date) = ANY(iso_days);
        END LOOP;
        
        counter := counter + 1;
    END LOOP;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;



CREATE OR REPLACE FUNCTION generate_subject_events(
    p_subject_id UUID,
    OUT event_count INT
) AS $$
DECLARE
    v_teaching_days TEXT[];
    v_lesson_count INT;
BEGIN
    SELECT teaching_days, lesson_count
    INTO v_teaching_days, v_lesson_count
    FROM subjects
    WHERE id = p_subject_id;

    IF NOT FOUND THEN
        RAISE NOTICE 'No subject found with ID: %', p_subject_id;
        event_count := 0;
        RETURN;
    END IF;
    
    event_count := 0;

    WITH inserted_events AS (
        INSERT INTO events (event_id, event_type, event_title, event_date, daily_order_index)
        SELECT 
            LS.id, 
            'subject', 
            LS.title, 
            GLS.schedule_date,  
            COALESCE(
                (SELECT MAX(E.daily_order_index) 
                 FROM events E 
                 WHERE E.event_date = GLS.schedule_date), 0
            ) + ROW_NUMBER() OVER (PARTITION BY GLS.schedule_date ORDER BY LS.lesson_number)
        FROM lessons LS
        LEFT JOIN LATERAL (
            SELECT GLS.lesson_number, GLS.schedule_date
            FROM generate_lesson_schedule_dates(v_lesson_count, v_teaching_days, CURRENT_DATE) GLS
        ) GLS
        ON GLS.lesson_number = LS.lesson_number
        WHERE LS.subject_id = p_subject_id
        RETURNING 1
    )
    SELECT COUNT(*) INTO event_count FROM inserted_events;
    RETURN;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;



CREATE OR REPLACE FUNCTION generate_one_off_events(
    p_one_off_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_title TEXT;
    v_schedule_date DATE;
    p_max_daily_order_index INT;
BEGIN
    SELECT title, schedule_date
    INTO v_title, v_schedule_date
    FROM one_offs
    WHERE id = p_one_off_id;

    IF NOT FOUND THEN
        RAISE NOTICE 'No one off found with ID: %', p_one_off_id;
        RETURN FALSE;
    END IF;
    
    SELECT COALESCE(MAX(daily_order_index), 0)
    INTO p_max_daily_order_index
    FROM events 
    WHERE event_date = v_schedule_date;

    INSERT INTO events (event_id, event_type, event_title, event_date, daily_order_index)
    VALUES (p_one_off_id, 'one_off', v_title, v_schedule_date, p_max_daily_order_index + 1);

    RETURN TRUE;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;



CREATE OR REPLACE FUNCTION insert_subject (data JSONB) RETURNS UUID AS $$
DECLARE
    new_id uuid;
    subject_name TEXT;
BEGIN
    INSERT INTO subjects (name, teaching_days, lesson_count)
    VALUES (
        data->>'name',
        ARRAY(SELECT jsonb_array_elements_text(data->'teaching_days')),
        (data->>'lesson_count')::INTEGER
    )
    RETURNING id, name INTO new_id, subject_name;

    FOR lesson_num IN 1..(data->>'lesson_count')::INTEGER LOOP
        INSERT INTO lessons (subject_id, lesson_number, title)
        VALUES (new_id, lesson_num, subject_name || ' - ' || lesson_num);
    END LOOP;

    PERFORM generate_subject_events(new_id);

    RETURN new_id;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;






CREATE OR REPLACE FUNCTION insert_one_off (data JSONB) RETURNS UUID AS $$
DECLARE
    new_id uuid;
BEGIN
    INSERT INTO one_offs (title, schedule_date)
    VALUES (
        data->>'title',
        (data->>'schedule_date')::DATE
    )
    RETURNING id INTO new_id;

    PERFORM generate_one_off_events(new_id);

    RETURN new_id;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER;