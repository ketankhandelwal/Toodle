-- CREATE DATABASE BY RUNNING THE QUERY
CREATE DATABASE toodle;

--  NOW IN THAT toodle (DATABASE) RUN ALL THE TOGETHER QUERY BY COYPING IT IN QUERY TOOL IN PG-ADMIN-4

CREATE TABLE IF NOT EXISTS public.assignment
(
    assignment_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 99999999 CACHE 1 ),
    description character varying COLLATE pg_catalog."default" NOT NULL,
    created_at bigint NOT NULL DEFAULT (date_part('epoch'::text, now()) * ((1000)::bigint)::double precision),
    updated_at bigint,
    published_at bigint,
    ending_at bigint,
    status integer NOT NULL,
    created_by integer,
    updated_by integer,
    CONSTRAINT assignment_pkey PRIMARY KEY (assignment_id)
);

CREATE TABLE IF NOT EXISTS public.student_assigned_list
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 99999999 CACHE 1 ),
    assigned_to integer NOT NULL,
    assigned_by integer,
    remark character varying COLLATE pg_catalog."default",
    status integer NOT NULL DEFAULT 0,
    created_at bigint DEFAULT (date_part('epoch'::text, now()) * ((1000)::bigint)::double precision),
    updated_at bigint,
    assignment_id integer,
    CONSTRAINT student_assigned_list_pkey PRIMARY KEY (id),
    CONSTRAINT unique_submission UNIQUE (assigned_to, assignment_id)
);

CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 99999999 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    role integer NOT NULL,
    created_at bigint NOT NULL DEFAULT (date_part('epoch'::text, now()) * ((1000)::bigint)::double precision),
    updated_at bigint,
    status integer NOT NULL,
    phone_no character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default",
    username character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT your_table_name_pkey PRIMARY KEY (id),
    CONSTRAINT unique_user_name UNIQUE (username)
);

ALTER TABLE IF EXISTS public.student_assigned_list
    ADD CONSTRAINT "assigned_by_FK_user_id" FOREIGN KEY (assigned_by)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID;


ALTER TABLE IF EXISTS public.student_assigned_list
    ADD CONSTRAINT "assigned_to_FK_user_id" FOREIGN KEY (assigned_to)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID;


ALTER TABLE IF EXISTS public.student_assigned_list
    ADD CONSTRAINT "assignment_id_FK_assignment" FOREIGN KEY (assignment_id)
    REFERENCES public.assignment (assignment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE
    NOT VALID;
	
INSERT INTO users (name , role, status , phone_no, email, username,password) VALUES ('Toodle Tutor',1,1,'7985850839','wilson@toddleapp.com','toodle.india.1','$2a$09$crjYTF7A4co5EWsPZMgQDunoiWbZ6yt1QTojxAE4pSy0CiIxVf6r6'), ('Toodle Student',2,1,9450091743,'arti@toddleapp.com','toodle.student.2','$2a$09$JEPjT1T0EQgpbbaNdiV3V.g6gLIW389xT37smg3Z8.3eRFD5EET4.');	

