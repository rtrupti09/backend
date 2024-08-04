--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- Name: account_credit_debit_ins(integer, integer, character varying, double precision, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.account_credit_debit_ins(in_mode integer, in_id integer, in_transaction_type character varying, in_amount double precision, in_inserted_by character varying, OUT out_error_code integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_balance float8;
BEGIN
    out_error_code := 0;

     SELECT COALESCE((
        SELECT balance
        FROM account_def
        WHERE user_id = in_id
        ORDER BY inserted_date DESC
        LIMIT 1
    ), 0) INTO v_balance;

    IF in_mode = 1 AND v_balance < in_amount THEN
        out_error_code := 500; 
        RETURN;
    END IF;

    INSERT INTO public.account_def
        (user_id, transaction_type, prev_balance, amount, balance, inserted_by, inserted_date)
    VALUES 
        (in_id, in_transaction_type, v_balance, 
         CASE WHEN in_mode = 0 THEN in_amount ELSE - in_amount END, 
         v_balance + CASE WHEN in_mode = 0 THEN in_amount ELSE - in_amount END, 
         in_inserted_by, 
         NOW());

EXCEPTION 
    WHEN NO_DATA_FOUND THEN
        out_error_code := 400;
    WHEN OTHERS THEN        
        out_error_code := 100;
END;
$$;


ALTER FUNCTION public.account_credit_debit_ins(in_mode integer, in_id integer, in_transaction_type character varying, in_amount double precision, in_inserted_by character varying, OUT out_error_code integer) OWNER TO postgres;

--
-- Name: user_create_update_delete_ins(integer, integer, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.user_create_update_delete_ins(in_mode integer, in_id integer, in_username character varying, in_email character varying, in_password character varying, in_role character varying, in_status character varying, in_inserted_by character varying, OUT out_error_code integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
begin
	out_error_code := 0;
	if in_mode = 0 then
		begin
			
			INSERT INTO public.user_def
			(username, email, "password", "role", status, inserted_by, inserted_date, updated_by, updated_date)
			VALUES(in_username, in_email, in_password, in_role, 'Active', in_inserted_by, now(), null, null);

		exception 
		when others then
		out_error_code := 100;
		end;
		
	elsif in_mode = 1 then
	begin
		
		UPDATE public.user_def
		SET username = in_username, email = in_email, "password" = in_password, "role" = in_role, status = in_status, updated_by = in_inserted_by,
		updated_date = now()
		WHERE id = in_id;
	
	 exception 
		when others then
		out_error_code := 110;
		end;
	end if;
end
$$;


ALTER FUNCTION public.user_create_update_delete_ins(in_mode integer, in_id integer, in_username character varying, in_email character varying, in_password character varying, in_role character varying, in_status character varying, in_inserted_by character varying, OUT out_error_code integer) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_def (
    id integer NOT NULL,
    user_id integer,
    transaction_type character varying,
    prev_balance double precision,
    amount double precision,
    balance double precision,
    inserted_by character varying,
    inserted_date timestamp without time zone,
    updated_by character varying,
    updated_date timestamp without time zone
);


ALTER TABLE public.account_def OWNER TO postgres;

--
-- Name: account_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.account_def_id_seq OWNER TO postgres;

--
-- Name: account_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_def_id_seq OWNED BY public.account_def.id;


--
-- Name: user_def; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_def (
    id integer NOT NULL,
    username character varying,
    email character varying,
    password character varying,
    role character varying,
    status character varying,
    last_login timestamp without time zone,
    inserted_by character varying,
    inserted_date timestamp without time zone,
    updated_by character varying,
    updated_date timestamp without time zone,
    name character varying
);


ALTER TABLE public.user_def OWNER TO postgres;

--
-- Name: user_def_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_def_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_def_id_seq OWNER TO postgres;

--
-- Name: user_def_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_def_id_seq OWNED BY public.user_def.id;


--
-- Name: account_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_def ALTER COLUMN id SET DEFAULT nextval('public.account_def_id_seq'::regclass);


--
-- Name: user_def id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_def ALTER COLUMN id SET DEFAULT nextval('public.user_def_id_seq'::regclass);


--
-- Data for Name: account_def; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account_def (id, user_id, transaction_type, prev_balance, amount, balance, inserted_by, inserted_date, updated_by, updated_date) FROM stdin;
11	2	CREDIT	0	500	500	CUSTOMER	2024-02-08 15:19:01.055964	\N	\N
12	2	DEBIT	500	-500	0	CUSTOMER	2024-02-08 15:20:50.459525	\N	\N
7	2	DEBIT	100	-100	0	CUSTOMER	2024-02-08 01:16:29.811691	\N	\N
6	2	CREDIT	0	100	100	CUSTOMER	2024-02-08 01:16:12.8146	\N	\N
\.


--
-- Data for Name: user_def; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_def (id, username, email, password, role, status, last_login, inserted_by, inserted_date, updated_by, updated_date, name) FROM stdin;
2	customer	customer@customer.com	53bf5aab80d25966d860ee0af1fcb31d	customer	Active	2024-02-08 15:16:21.976214	customer	2024-02-07 16:31:14.806852	\N	\N	Deepak Kamtekar
1	banker	admin@admin.com	53bf5aab80d25966d860ee0af1fcb31d	banker	Active	2024-02-08 15:21:04.381328	admin	2024-02-07 14:27:00.632459	\N	\N	admin
\.


--
-- Name: account_def_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.account_def_id_seq', 12, true);


--
-- Name: user_def_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_def_id_seq', 2, true);


--
-- Name: account_def account_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_def
    ADD CONSTRAINT account_def_pkey PRIMARY KEY (id);


--
-- Name: user_def user_def_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_def
    ADD CONSTRAINT user_def_email_key UNIQUE (email);


--
-- Name: user_def user_def_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_def
    ADD CONSTRAINT user_def_pkey PRIMARY KEY (id);


--
-- Name: user_def user_def_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_def
    ADD CONSTRAINT user_def_username_key UNIQUE (username);


--
-- PostgreSQL database dump complete
--

