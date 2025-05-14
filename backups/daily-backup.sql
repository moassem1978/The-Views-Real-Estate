--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    start_date timestamp without time zone DEFAULT now() NOT NULL,
    end_date timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_highlighted boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by integer DEFAULT 1,
    approved_by integer,
    updated_at timestamp without time zone
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    project_name text NOT NULL,
    description text NOT NULL,
    location text NOT NULL,
    about_developer text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    approved_by integer,
    unit_types jsonb DEFAULT '[]'::jsonb NOT NULL,
    images jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    price double precision NOT NULL,
    down_payment double precision,
    installment_amount double precision,
    installment_period integer,
    is_full_cash boolean DEFAULT false,
    listing_type text NOT NULL,
    project_name text,
    developer_name text,
    bedrooms integer NOT NULL,
    bathrooms double precision NOT NULL,
    built_up_area integer NOT NULL,
    plot_size integer,
    garden_size integer,
    floor integer,
    is_ground_unit boolean DEFAULT false,
    property_type text NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_new_listing boolean DEFAULT false NOT NULL,
    is_highlighted boolean DEFAULT false NOT NULL,
    year_built integer,
    views text,
    amenities jsonb NOT NULL,
    images jsonb NOT NULL,
    latitude double precision,
    longitude double precision,
    created_at text NOT NULL,
    agent_id integer NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by integer DEFAULT 1,
    approved_by integer,
    updated_at timestamp without time zone,
    country text DEFAULT 'Egypt'::text NOT NULL,
    reference_number text DEFAULT ''::text
);


--
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    client_name text NOT NULL,
    client_location text NOT NULL,
    rating integer NOT NULL,
    testimonial text NOT NULL,
    initials text NOT NULL,
    created_at text NOT NULL
);


--
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    is_agent boolean DEFAULT false NOT NULL,
    created_at text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    created_by integer,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, content, image_url, start_date, end_date, is_active, is_featured, is_highlighted, created_at, status, created_by, approved_by, updated_at) FROM stdin;
5	Big thanks 	Big big thanks 	/uploads/announcements/image-1743484448046-607287545.jpeg	2025-04-01 00:00:00	\N	t	f	t	2025-04-01 05:14:10.351776	draft	1	\N	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, created_by, created_at, updated_at, project_name, description, location, about_developer, status, approved_by, unit_types, images) FROM stdin;
3	1	2025-04-23 20:57:13.314199	\N	Swan Lake Residences	An exclusive residential project with beautiful views of Swan Lake.	Cairo	Swan Developers has been creating luxury properties since 2005.	published	\N	["Apartment", "Penthouse"]	[]
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.properties (id, title, description, address, city, state, zip_code, price, down_payment, installment_amount, installment_period, is_full_cash, listing_type, project_name, developer_name, bedrooms, bathrooms, built_up_area, plot_size, garden_size, floor, is_ground_unit, property_type, is_featured, is_new_listing, is_highlighted, year_built, views, amenities, images, latitude, longitude, created_at, agent_id, status, created_by, approved_by, updated_at, country, reference_number) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
HwymUPRMp6l016jVv6lvAAqgRMWNo5Bj	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T20:57:07.813Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 20:57:22
qrFvPv5N0DQjxImohc6viPOj9jLa9yYU	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-27T19:10:47.312Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-27 20:47:38
OQbnDXCptonpB0TqseEVGXX-gGhbm6ak	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T20:42:42.542Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 21:31:20
7r5AzWx8vXLvZ5X3-6ZUYQ4_h4ewYPws	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T21:34:22.172Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 09:56:25
kXZ6ARU7YxgwIxxrYoD4BcwjYVTR4PcC	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T18:27:08.566Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 18:27:20
ocssX5cIIwzzf1lVJJ1hEuIjFGo2XYGg	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-24T11:15:18.754Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 16:18:39
KTveJymC2pwX5s7TV0I0loF0BJvk5g0F	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T06:26:05.987Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 11:29:29
-J8XGTXtlkoZUKImYIWHNimcSmUy2EHM	{"cookie":{"originalMaxAge":2591999999,"expires":"2025-05-14T22:04:09.778Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-21 10:04:24
HPGdPC0c0E8D-dLyIDSkdNMRL0drxYuB	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-27T06:50:01.891Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-28 11:03:16
t2FdVL-8mAFTISxawcTHktyhKt54PCT7	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T18:31:08.455Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 18:32:06
nNdb0k2q0s7iV7_lsd8APvNrGtlBtQ75	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-24T09:58:34.885Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 10:22:07
Y1wtaJKecbYEC7StEVgwJ_DlojV2irEM	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T11:31:11.746Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 20:42:02
PUgIbYbvz8WwWILQfqrSZBhxzUAm1rrl	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T14:50:15.962Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-07 17:23:22
dFHz06UsD45maPBTgdMfdCcasKwUmlKb	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-06-25T14:18:21.745Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-25 14:18:22
V-p9KcYT2VSUhAL-s8N9OgJEPFnjSWdh	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-30T07:58:37.340Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-31 08:26:05
Ud-hbjYlglc1Ee9pBTnVXYVc76RQZX9p	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-28T12:52:22.469Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-30 07:36:51
rcjn8esDfZVxg0g9nVQBAh0WqS3EO-ML	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-30T19:16:38.673Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-30 19:25:56
gG1wx0J9pfjrM-46M_krhfcQNaPqE8Uv	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-24T10:22:40.128Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 10:38:43
vXIED9PMPxv-Ws-mkUjzoYF0HlVZkAKm	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-30T19:31:18.718Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-30 19:34:50
TZF2NRt7YyQbhCJRzkeEHfOYAB07fPR6	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-24T21:16:36.095Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-25 20:53:59
A8r572pc8ojdpxvZPQ9wsufQ4oHF4M2a	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-30T17:53:32.367Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-30 19:15:44
Z_bMXLhzr3oxo6kQVKfvL1kgyztLADM7	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-24T16:19:32.364Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 17:00:48
85PykP19CzPJ1xuKTlIzMSPINf6RpunG	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-28T07:09:51.547Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-28 07:14:55
8OrT4vb0l1M2DXAJm5lHsXjOOyIGWC-0	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-30T17:21:42.303Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-30 17:53:12
qvZbcJVv0YD7PiXRDkh6bXj8kyGq3nVj	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-29T05:39:55.423Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-31 08:16:41
uMX9chfiZ6BNq_mR_NGyflv0jb5mljWY	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-24T17:06:30.859Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 18:28:14
poiiC3ECnT8X1eNGaTTTriZWGirQlbiM	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-28T07:20:08.811Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-28 08:16:51
nAN9tMAGflHeRPO90DfHPeCmWHff2lN0	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-25T20:54:46.290Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-26 12:59:47
0IQB_1qNkKlYHHjI_IFrS0gTJAsiv7fR	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-26T13:31:47.024Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-26 16:24:38
q-HLyejXFgASNSBamZi4OZvW65cr1JCE	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-22T18:39:42.103Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 06:11:17
k7e8t-Un5r6F3aTHZJWzfxO8rRMW7JNc	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T18:29:11.249Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 18:29:18
t_pFjWVr21Q2t5eamtoTabx-x9A4cI7E	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-22T17:18:48.781Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-22 18:39:08
AhPiwXeInSvSCqWUjEF50pPf7xygismc	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T20:57:55.912Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 20:58:58
wAw1hCyk6GHqN7dpRyuJ4m9gkWx95fRJ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T11:22:50.423Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-07 16:12:48
y3GzV1dFfAgJ7RAQhz5kVkZY67NhR7U6	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-30T20:02:23.221Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-31 09:35:47
a5eiF1w-fLjhV9_f5yB7EvwH2DH6sA_U	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-09T21:22:35.459Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-09 21:22:36
WVqjbPWsB4tEQbOKRY2Tr4HRWEfb9MEZ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T16:07:20.757Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-08 08:08:07
lpdCJWFDVE2WbwMl1VOXgpWeqTJuywQv	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-31T09:46:01.066Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-07 17:40:55
fGO0xmPGwEfDX5bjtbGuXEJXcmfMGret	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-31T09:36:11.606Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-08 11:51:40
p1nw0jNB8-gPIqiUuHVHUiVFM2RzsZ2k	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-10T13:00:43.863Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-10 13:00:44
K0Y7Iabhe6KCH1AesTXMBUEXlvn8Qf6Y	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-18T19:48:07.513Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 18:23:27
0f-aRaM3BiNmyYibIYkcaeOd8DNG6Dam	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-11T14:33:28.029Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-17 11:27:42
jmPl_FaVRnuEFBpd20jSKFOkSskNRG-8	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T09:30:35.349Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-07 11:16:35
tt_QJi4v87u_WwkRDWeI7hqeNx168L9k	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T11:52:22.893Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-08 12:08:04
YrmaV_5ScaP_Q6ljmxpEDHsftaaXRjdr	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-09T09:44:22.511Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-09 09:44:23
uY1tNQ2x2CZojFzMHXmLbFHLbFmWqh4r	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-06-27T20:22:23.368Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-27 20:22:24
TnSxEF8M9HHiol1S2Fsl2rVLmU-fp4Mh	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-10T12:59:19.606Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-10 12:59:20
TJVg3vG0-5JQR3FIUiSwxYovbmW0IUpe	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-06-28T21:10:19.399Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-28 21:10:20
gAGSydMfZILLLRgjUnwOUEd-ey3EvkzU	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-11T12:48:18.272Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-11 13:51:28
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, client_name, client_location, rating, testimonial, initials, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, email, full_name, phone, is_agent, created_at, role, created_by, is_active) FROM stdin;
1	owner	e28a9cf9af32ddc8076256cadf0cc38d7c1a6f49feb8d1ad1d28075a22b7f3d2f8fa3b8413906869e5cd5f26ae0c8b6e0b147145332cd13ebae70b0685be8dd2.ce5f5bea626955ad9c7291faa99c17ff	owner@theviews.com	System Owner	\N	t	2025-04-04T05:33:01.546Z	owner	\N	t
2	Dina	6db0d437fe53359aafbf1b8f9abea096cb93ba0a9a3e68f2e061d025b0d418c2a3c0f9a0b055488a6968b8dbb0a8e6aab3e0ab60150d23c08d268b0e6649fe0b.405a94cd5000bccaf5592d15efc38709	assem@theviewsconsultancy.com	Dina Mohamed 		f	2025-04-04T13:44:32.994Z	admin	1	t
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 5, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 3, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.properties_id_seq', 1, false);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- PostgreSQL database dump complete
--

