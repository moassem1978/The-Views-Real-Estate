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
18	Town house for sale in Owest	Town house Middle.   -   Fully Finished.   -   Ground +first+roof.  -   Total Price: 22,000,000\n\nO West Compound is one of the most elite projects by Orascom Development in the 6th of October City. It is a perfect fully integrated gated community, spreading across 1,007 acres of land, where every sqm of the compound was utilized to offer you a one-of-a-kind experience.\n\nOrascom crafted a distinguishing master plan for O West 6 October Compound. It features numberless comfortable and luxurious facilities as well as lavish homes. It also implemented a wide range of premium services in the project to grant the residents a comfortable lifestyle at its finest.\n\nThe comfortable living experience of O West Compound also includes a prime location that you can easily commute from. Orascom made sure you experience a convenient lifestyle outside as well as inside. \n\nIt also merged these advantages with luxury, building a notable collection of elite homes in the O West Compound, with different layouts and sizes to cater to different families. 		Zayed	West cairo	12311	21300000	0	0	0	f	Resale	Owest		4	4	210	200	0	0	f	Townhouse	t	t	t	0		[]	["/uploads/properties/2a096e5c404bb5c4018abcaef9738651", "/uploads/properties/903f0d3a301edb0e4080d8a06a029489", "/uploads/properties/f617883321384e8afc906eb21222becc"]	0	0	2025-04-24T16:56:45.587Z	1	published	1	\N	\N	Egypt	PROP-789012
15	Apartment for sale in Marassi Marina2	Prime Location Apartment.   -     Maid’s room + toilet\n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\n\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \n\nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \n\nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.		North coast	North coast 	00000	35000000	0	0	0	f	Resale	Marassi		3	3	198	0	0	1	f	Apartment	t	t	t	0		[]	["/uploads/properties/0af8bc624434627a31a2296ee17269e3", "/uploads/properties/7af000ed3c55d77a16d10a62c783be05", "/uploads/properties/caa9a1ee0c24ec9256a295c03e5fb4e3"]	0	0	2025-04-24T16:33:59.240Z	1	published	1	\N	\N	Egypt	
11	3 IN 1 Chalet for sale in Hacienda west	Basement: 26 Sqm.  -   Total Price: 25,000,000    - remaining 4,233,000 till 2032 \n\nHacienda West in Ras El Hekma, North Coast is an exquisite summer gateway by the reputable developer, Palm Hills Developments.\n\nHacienda West is created to be a heavenly escape in Ras El Hekma, where you can unwind and chill with picturesque sea views, lush greenery, and endless activities. The high-end resort offers you a home away from home with all the luxuries of the city combined with everything you need for the perfect vacation.		North coast	North coast	00000	20767000	0	0	0	f	Resale	Hacienda west		3	3	221	0	332	0	t	Chalet	t	t	f	0	Other	[]	["/uploads/properties/8b001f1d93612d879ac06be928f2c49b"]	0	0	2025-04-24T16:39:34.599Z	1	published	1	\N	\N	Egypt	
9	Stand alone villa for sale in Zed East	Ground + First Floor.  -    Type B.     -    Fully Finished.   -    Total Price: 46 Mil - Remaining: 9,592,824\n\nZED East New Cairo Compound is a prestigious project by Ora Developers. It covers 360 acres of land in the heart of New Cairo, one of the most prestigious areas in the East. \n\nOra delivered the ZED East Compound to offer its clients a sustainable living experience within an elite community in the city. It designed a unique master plan for the project, including a wide range of high-end facilities and luxurious houses. It also implemented various premium services in the ZED 5th Settlement Compound to ensure a comfortable living environment.\n\nOra placed the Z East Compound in a strategic location in New Cairo, amid many high-end projects, popular destinations, and major roads.		Cairo	East cairo	11511	36407176	0	0	0	f	Resale	Zed East		4	4	286	482	0	0	f	Villa	t	t	f	0	Other	[]	["/uploads/properties/473058c14f6b6b939bf37f2692444075", "/uploads/properties/5d970e8e4f451827892a587dbbf834a9", "/uploads/properties/0fbbcaef5bdc49385891420f0c6a024b"]	0	0	2025-04-24T16:44:43.125Z	1	published	1	\N	\N	Egypt	
13	Penthouse for sale in Solana West	Maids room + toilet.      -    Total Price: 24,676,000  -   Remaining installments: 19,776,000\n\nSolana New Zayed Compound is one of the most splendid projects by Ora Developers in the West of Cairo. It spreads across 316 acres of land in New Sheikh Zayed, whereas a master plan was designed for the Solana Project to turn such a large space into a distinctive gated community. It features a wide range of elite facilities and luxurious homes; not to mention that Ora Developers introduced new innovative typologies in the Solana Zayed Compound. \n\nFurthermore, Ora included a broad array of exclusive services in Solana Compound, aiming at the residents’ comfort and offering them the perfect opportunity to step into a seamless living experience. Ora Developers also chose a strategic location for Solana New Zayed, between Dabaa Corridor and the Middle Ring Road, for the utmost convenient life outside the compound as well. 		Zayed	West cairo	12311	4900000	0	0	0	f	Resale	Solana west		4	4	232	0	0	4	f	Penthouse	t	t	f	0	Landmark View	[]	["/uploads/properties/ff2cea15e9271c937176eea62bcb5112", "/uploads/properties/64993aca9b7098834135432795df9316", "/uploads/properties/10b5bff868368ed4d074c21ee6f72e19", "/uploads/properties/9a52f63a2778d0a1e73bb66e59fb5709"]	0	0	2025-04-24T16:51:06.561Z	1	published	1	\N	\N	Egypt	
20	Luxurious villa for sale in Marassi	Marassi Verona.   -   Plot: 700sqm.  -     Villa direct on Lagoon.     -      Premium finishing.     -       Maid’s room + Driver’s room\n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\n\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \n\nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \n\nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.		North coast	North Coast	00000	1	0	0	0	f	Resale	Marassi	Emaar	5	7	466	7000	0	0	f	villa	t	t	t	\N		[]	["/uploads/properties/da5bdf67802888f33d29638b4f000797", "/uploads/properties/b34266032d0e4409b086760635ff5153", "/uploads/properties/474450d2c3cf257b43cdb2dbbd1b88fb", "/uploads/properties/433b4961c8f42b82c602c4ad100d8381", "/uploads/properties/1795100eb0fa66b4314c97ebd55bbcca"]	0	0	2025-04-24T16:31:49.549Z	1	published	1	\N	\N	Egypt	EM 6060
8	Premium villa for sale in hacienda Bay	Water villa - lagoon view\n\nHacienda Bay Sidi Abdel Rahman Resort is one of the finest projects in the North Coast by Palm Hills Developments, reshaping the coastal living experience. It spreads across 2.4 million sqm in the North Coast, featuring high-end facilities and luxurious beach houses.\n\nPalm Hills elevated the standards of summertime fun, comfort, and luxury in Hacienda Bay North Coast Resort. The residents of Hacienda Bay will not only experience the beauty of the Mediterranean Sea but also the resort’s distinguishing amenities. \n\nThe premium amenities of Hacienda Bay vary from your gateway to a tranquil vacation to safety, convenience, lavishness, and your family’s most exciting summer. \n\nPalm Hills made sure your stay in Hacienda Bay Sidi Abdel Rahman will go beyond convenience, that’s why it turned every sqm of the project to reflect a coastal haven.		North coast	North coast	00000	50000000	0	0	0	f	Resale	Hacienda Bay		4	5	500	1460	0	0	f	Villa	t	t	t	0	Other	["Swimmingpool"]	["/uploads/properties/62568d7a736765ce33386b2bc5496498", "/uploads/properties/af5aad98d756ba3f66db8e4683ed10cc", "/uploads/properties/6518b5005496b71a82a9012057e6515f"]	0	0	2025-04-24T16:35:35.214Z	1	published	1	\N	\N	Egypt	
33	Exclusive Villa in Lake View	Villa For sale in Lake View  -  extremely prime location\nBasement + Ground + First Floor\n4 Master Bedrooms - Laundry room - Maid's room - Gym.\n\nLake View Compound is one of the most elite projects in New Cairo, developed by El Hazek over 300 acres of land in the Fifth Settlement. The project features a broad array of elite amenities that are aimed at the residents’ ultimate convenience. \n\nThe developer of Lake View Residence designed a master plan for the compound exhibiting a myriad of high-end facilities, open spaces, and luxurious units. From essential facilities to recreational spaces, the project perfectly merges architectural innovation and vital resources. \n\nAdditionally, for the utmost comfort of homeowners, El Hazek smartly chose the location of Lake View Residence Compound in New Cairo. It is in the Golden Square and close to many popular destinations and main roads in the area. \n\n		Cairo		11511	6	0	0	0	f	Resale	lake view		4	5	1500	1500	0	0	f	Villa	t	t	t	0	Garden View	[]	["/uploads/properties/37b3cad936ef16ea5f13c06dcac285e0", "/uploads/properties/9e6cc19e3c9f69871fd9de82cb1430d0"]	0	0	2025-04-24T17:00:25.559Z	1	published	1	\N	\N	Egypt	
10	Ground chalet for sale in Silver Sands	Chalet for sale.    -  Total Price: 22,582,000   -  Remaining installments: 11,582,000\n\nSilver Town is one of the magnificent phases inside Silversands Resort by Ora Developers in Sidi Heneish, North Coast.\n\nSilver Town is a fully-fledged bustling commercial island designed as a town where energy is vibrant and where all can find a place to vibe and enjoy. \n\nThanks to its central location inside Silversands, its top-tier facilities, and its top-notch services, Silver Town Ora is the ultimate destination for relaxation and immersing in luxury. 		North coast	North Coast	00000	11000000	0	0	0	f	Resale	Silver sands		4	3	204	0	120	0	t	Chalet	t	t	f	0		[]	["/uploads/properties/ce33122fd894037334777bbcbb62b414", "/uploads/properties/b705db5e7924d541cf517fc39974428b"]	0	0	2025-04-24T16:47:52.536Z	1	published	1	\N	\N	Egypt	
16	Apartment for sale in Marassi Marina	Prime location.   -     Maid’s room + toilet.     -       Upgraded kitchen & AC’s\n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\n\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \n\nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \n\nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.		North coast	North coast 	00000	45000000	0	0	0	f	Resale	Marassi	Emaar	3	3	311	0	0	3	f	apartment	t	t	t	\N	Sea View	[]	["/uploads/properties/b2edeccbf6b851f5c71d05dd051d35cc", "/uploads/properties/8f0a9e7ab15221d6e1ba8c11421f9af5", "/uploads/properties/c0f4e56663cca79c2be70aad1cc6a6fd", "/uploads/properties/d5d3b003870f3597622c4c752b45b854"]	0	0	2025-04-24T16:33:16.658Z	1	published	1	\N	\N	Egypt	EM 5070
14	Apartment for sale in Villette	Fully Finished.     -       Ready to move\n\nSODIC introduced a green haven in the heart of New Cairo, Villette Compound. Villette is one of SODIC’s finest projects, offering the bewitching vibes of suburban tranquility and a refreshing atmosphere. It offers a one-of-a-kind living experience where the luxury of urban living merges with the peacefulness a sustainable lifestyle can bring.\n\nSODIC developed Villette Compound over 301 acres of land in New Cairo, combining premium elements essential to unraveling a comfortable and lavish lifestyle. It crafted a unique master plan for Villette New Cairo, featuring prime facilities and luxurious homes. \n\nSODIC also implemented a variety of services in Villette to offer you a convenient lifestyle at its finest, and located the compound in a strategic location in New Cairo so you can experience such convenience emerging from inside the project outwards as well. 		Cairo	East cairo	11511	11500000	0	0	0	f	Resale	Villette		2	3	160	0	0	3	f	Apartment	t	t	f	0	Garden View	[]	["/uploads/properties/26a2de1b2c663a0dc464f9199a6de6bc", "/uploads/properties/e010f25dba95c354104b76bffa657c58", "/uploads/properties/5256be875ec6e5fe1f6eaf8fc3748eda", "/uploads/properties/f7c5d2635efed8809ef62eb73b91b665"]	0	0	2025-04-24T16:52:30.167Z	1	published	1	\N	\N	Egypt	
17	Twin house for sale in Atrio Zayed	Fully Finished.    -       Ground + First floor + Roof.    -     Maid’s room + toilet\n\nThe name “ATRIO,” taken from the Italian word for “court” or “lobby,” reflects the sophisticated Italian architectural style that is evident throughout the units.\n\nThe ATRIO Compound was developed by the real estate company, IWAN Developments, in the heart of Western Cairo. It's filled to the brim with endless premium facilities catering to your needs. Moreover, ATRIO Compound Sheikh Zayed has an ideal location and upscale properties for sale that come with various layouts and prices offering you a wide array of options to choose from. \n\nATRIO serves as IWAN’s premier project, showcasing its commitment to crafting outstanding living environments. They strive to surpass your expectations and ensure a seamless and hassle-free homeownership experience by providing fully finished units within a thoughtfully designed and completed community.\n\nAt the ATRIO Compound, you’re not just gaining a new residence; you’re embracing a lifestyle defined by comfort and convenience.		Zayed	West cairo	12311	20000000	0	0	0	f	Resale	Atrio		3	3	254	283	0	0	f	Twinhouse	t	t	f	0		[]	["/uploads/properties/b29a8afd288c715eb9d203e829eba84d", "/uploads/properties/974c60264b4e732383d1ac8f43d72331", "/uploads/properties/1483f366a88bd4fb2593a7a1922ce09e", "/uploads/properties/53de62f622cab1831a153d9365e8c719"]	0	0	2025-04-24T16:54:09.896Z	1	published	1	\N	\N	Egypt	
19	Stand-alone villa for sale in Rehab Hills	Ground +first floor +roof.      -      Fully finished.    -      Ready to move\n\nEl Rehab is one of the finest projects by Talaat Mostafa Group (TMG) Holding in New Cairo. It is a fully integrated community, where the tranquility sustainability brings and the luxury of urban lifestyle intertwine perfectly. TMG built Al Rehab over 10 million sqm in New Cairo, introducing a finesse haven of elite homes and boundless distinctive amenities in the compound. \n\nIt designed a master plan for Al Rehab Project featuring a wide range of natural elements and high-end facilities. It also included a broad array of premium services in the compound to offer homeowners a hassle-free living experience at its finest, where their security and privacy are prioritized. \n\nMoreover, Talaat Mostafa chose a strategic location for El Rehab in New Cairo, close to its popular destinations and vital facilities, and only 20 minutes away from Downtown Cairo. It made sure the residents could easily reach any destination they wanted, locating the project close to several main roads. 		Cairo	East cairo	11511	50000000	0	0	0	f	Resale	Rehab Hills		4	5	350	667	0	0	f	Villa	t	t	f	0	Garden View	["Swimmingpool"]	["/uploads/properties/1f2da18952a2d8765d152938dcc79824", "/uploads/properties/579770905830e659ca06bed7afb54959", "/uploads/properties/0e64d1e5dc10260a2fc72de7c7ee69b6", "/uploads/properties/7a1cf7af56bdb59bbcff5ac26cda0e79"]	0	0	2025-04-24T16:59:33.775Z	1	published	1	\N	\N	Egypt	
32	Duplex for sale in Village Gate	Prime Location - Fully Finished - Central AC's & Heating - Fully home automated\n\n\nThe Village Gate Compound is a distinguishing contemporary project developed by Palm Hills over 31 acres of land in the heart of New Cairo. It was built to merge between all the factors composing serene and luxurious lifestyles. \n\nPalm Hills Developments perfectly constructed a fancy collection of units in The Village Gate New Cairo that cater to various family needs and preferences. They are accompanied by a myriad of high-end amenities, granting homeowners a seamless living experience at its finest. \n\nFor a trouble-free experience outside the compound as well, Palm Hills ideally located at The Village Gate in New Cairo to be near several main roads, ensuring its residents easy commuting to anywhere they want to reach. 		Cairo		11511	17000000	0	0	0	f	Resale	Village Gate		3	2	195	0	50	0	t	Apartment	t	t	t	0	Garden View	[]	["/uploads/properties/285885d6a6dc6b7d1fd496e8fc65d861", "/uploads/properties/3a752117421829ca784c8d6f19064f38", "/uploads/properties/d52212f98e5636be2f3d1ec152bfc3c0"]	0	0	2025-04-24T17:00:08.242Z	1	published	1	\N	\N	Egypt	
34	Apartment for sale in Swan lake Residences	Lake view  The Phoenix  - Wide View - Total Price: 8.7 Mil - Remaining installments: 1,257,480 Till 2028\nDelivery Date: Q2 / 2026\n\nThe Phoenix Neighborhood is one of the elite phases of Swan Lake Residences New Cairo, developed by the real estate tycoon, Hassan Allam Properties. The project sprawls over 460 acres of total land area. It boasts a broad array of amenities, all aimed at homeowners’ utmost satisfaction and comfort. \n\nThe Phoenix Swan Lake Residences location is in New Cairo, in proximity to its popular attractions, such as El Rehab and Cairo Festival City Mall. \n\nSwan Lake Residence is a mixed-use project by the leading developer, Hassan Allam Properties, in New Cairo. In order to revitalize Cairo's beloved east side, twelve upscale gated communities converge in one central location. Everyone can eventually experience the finest essence of life at Swan Lake Residence, where elegant living options are thoughtfully crafted to suit unique culture, architectural symmetry, and timeless accuracy.\n\nThe project, which spans more than 460 acres and is a mixed-use development by Hassan Allam Properties, consists of office park space, retail and commercial space, a boutique hotel, and low- and mid-rise residential components.		Cairo		11511	7442520	0	0	0	f	Resale	Swanlake residences		2	1	93	0	0	4	f	Apartment	f	t	f	0	Garden View	[]	["/uploads/properties/bf89791a22af01c9338720ef642b7441"]	0	0	2025-04-24T17:18:25.548Z	1	published	1	\N	\N	Egypt	
35	Standalone Villa for sale in Dyar	Standalone Villa -      Ground + 1st + Roof      - Semi Finished\n\nDyar compound is one of the top-notch residential compounds in New Cairo. It is brought to the real estate scene by ARCO developments. The compound is full of high-end amenities and services that make your life there a unique one. \n\nAlso, Dyar Compound enjoys a wide range of unique selling points, including its premium location in New Cairo City and the amenities it has to offer to its residents.		Cairo		11511	35000000	0	0	0	f	Resale	Dyar		4	5	370	694	0	0	f	Villa	t	t	t	0	Garden View	[]	["/uploads/properties/a3c0b67d82ab5710f5e8299696571249"]	0	0	2025-04-24T17:45:07.045Z	1	published	1	\N	\N	Egypt	
36	Apartment for sale in Zed West	Residential Tower - Fully Finished with AC's\n\nZED Skeikh Zayed Towers is a residential phase inside the huge project Zed El Sheik Zayed. The project is brought to the real estate scene by Ora Developers. \n\nOnce again upending the real estate market, ZED Tower, the company's last tower, is committed to taking the idea of refinement even higher than any other Cairo construction. With all your requirements taken care of, the Tower is a luxurious take on a model high-rise residence that exudes sophistication, distinction, and a sense of home. Among the serviced houses are stunning apartments that are necessary rather than only a wish.		Zayed		00000	9500000	0	0	0	f	Resale	ZED WEST		2	2	100	0	0	9	f	Apartment	t	t	f	0	Other	[]	["/uploads/properties/248e2d35d90bbf1ac0f190b98296a935"]	0	0	2025-04-24T18:25:57.058Z	1	published	1	\N	\N	Egypt	
37	Apartment for sale in Westown 209m	Fully Finished Apartment with AC's & Kitchen - Maid's room + Toilet\n\nSODIC West is one of the fanciest projects in Egypt, and Westown Residence El Sheikh Zayed is considered one of its state-of-the-art sub-compounds which boasts an elite collection of units and distinguishing amenities. \n\nSODIC designed a master plan for the Westown Residence Compound to sketch its high-end facilities and luxurious homes. It also made sure the project was a natural haven to offer homeowners a serene living environment at its finest. Not to mention that, for a comfortable experience, it included a variety of services in the project too.\n\nMoreover, the location of Westown Residence was ideally picked in El Sheikh Zayed, for a seamless commute. It is also in proximity to many of the popular destinations inside the SODIC West Compound. 		Zayed		00000	16750000	0	0	0	f	Resale	Westown		3	2	209	0	0	2	f	Apartment	t	t	f	0	Garden View	[]	["/uploads/properties/c65af4998f61abf95b7bdf6759759a54"]	0	0	2025-04-24T21:31:22.826Z	1	published	1	\N	\N	Egypt	
39	Ground Apartment 156m in The View	Fully Finished Ground Floor Apartment - Total Price: 24,033,000 - Down payment:10% - The Rest over 6 Years equal installments \n\n\nThe Waterway Developments' real estate evolution continues at pace, as its most recent new developments are set to become famous landmarks due to their striking design, the modern-day heirs to iconic buildings and commercial ventures. As a world class real estate trendsetter with intense experiences of the various projects, The Waterway Developments presents THE VIEW, a new upcoming, luxury love affair mixed use project, dominating a new address in town; To View Life in Full View.\n\nThe Waterway Developments invites you to THE VIEW, the next high-end community complex and a\ngenerously appointed land surface that will reign on supreme royalty housing and luxury services in the heart of New Cairo. Since the planning and designing of mixed-use neighborhoods and individual developments are on the rise, our developments present and feature a variety of offerings, bringing many of life's daily conveniences to one place.		Cairo		11511	24033000	2403300	0	0	f	Primary	The View Waterway		2	2	156	0	50	0	t	Apartment	t	t	f	0	Garden View	[]	["/uploads/properties/613f73d352d76a3cf644f38166107032"]	0	0	2025-04-25T20:52:54.387Z	1	published	1	\N	\N	Egypt	
40	Apartment 2 Bedrooms in the view	Apartment Fully Finished with installments over 6 years \n\nThe Waterway Developments' real estate evolution continues at pace, as its most recent new developments are set to become famous landmarks due to their striking design, the modern-day heirs to iconic buildings and commercial ventures. As a world class real estate trendsetter with intense experiences of the various projects, The Waterway Developments presents THE VIEW, a new upcoming, luxury love affair mixed use project, dominating a new address in town; To View Life in Full View.\n\nThe Waterway Developments invites you to THE VIEW, the next high-end community complex and a generously appointed land surface that will reign on supreme royalty housing and luxury services in the heart of New Cairo. Since the planning and designing of mixed-use neighborhoods and individual developments are on the rise, our developments present and feature a variety of offerings, bringing many of life's daily conveniences to one place.\n		Cairo		11511	20900000	2090000	0	0	f	Primary	The View Waterway		2	2	170	0	0	2	f	Apartment	f	t	f	0	Garden View	[]	["/uploads/properties/647a64618ad74089466ce70709b59b3c"]	0	0	2025-04-25T21:14:13.138Z	1	published	1	\N	\N	Egypt	
41	Apartment 3 Bedrooms in The View	Fully Finished Apartment for sale with installments over 6 Years\n\nThe Waterway Developments' real estate evolution continues at pace, as its most recent new developments are set to become famous landmarks due to their striking design, the modern-day heirs to iconic buildings and commercial ventures. As a world class real estate trendsetter with intense experiences of the various projects, The Waterway Developments presents THE VIEW, a new upcoming, luxury love affair mixed use project, dominating a new address in town; To View Life in Full View.\n\nThe Waterway Developments invites you to THE VIEW, the next high-end community complex and a generously appointed land surface that will reign on supreme royalty housing and luxury services in the heart of New Cairo. Since the planning and designing of mixed-use neighborhoods and individual developments are on the rise, our developments present and feature a variety of offerings, bringing many of life's daily conveniences to one place.\n		Cairo		11511	21741000	2174100	0	0	f	Primary	The View Waterway		3	2	177	0	0	3	f	Apartment	t	t	f	0	Garden View	[]	["/uploads/properties/fe2f21ac0f542ecb2f3805b5bed94567"]	0	0	2025-04-25T21:18:01.137Z	1	published	1	\N	\N	Egypt	
43	1 Bedroom Apartment in The Capitalway	Apartment for sale in The Capitalway - New Capital     With installments over 6 years\n\nCapitalway by The WaterWay Developments is one of the most dazzling mixed-used projects in Egypt. It covers a massive area of 42 acres of land. The Capitalway New Capital merges transformative architecture with aesthetic landscapes and water features to generate a residential haven adjacent to a sophisticated commercial strip. \nThe Capitalway is a high-end mix-used project developed by the real estate giant, the WaterWay Developments Company across 42 acres of land in eastern Cairo.\nThe Capitalway Compound isn't just a place to invest or live; it's a project where people will enjoy the endless facilities, an ideal location, and a wide array of upscale properties for sale that come with diverse layouts and prices. \nThe Capital Way New Capital Project is the perfect place for both investors and residents who want to enjoy the finer things while investing wisely in New Capital City. \n		Cairo		11511	6913000	691300	0	0	f	Primary	The Capitalway		1	1	90	0	0	1	f	Apartment	f	t	f	0	Landmark View	[]	["/uploads/properties/e5277885c725a6e8e6c6d4b2752dd75f"]	0	0	2025-04-25T21:38:10.492Z	1	published	1	\N	\N	Egypt	
44	2 Bedrooms Apartment in The Capitalway	Apartment for sale in The Capitalway - New Capital With installments over 6 years\n\nCapitalway by The WaterWay Developments is one of the most dazzling mixed-used projects in Egypt. It covers a massive area of 42 acres of land. The Capitalway New Capital merges transformative architecture with aesthetic landscapes and water features to generate a residential haven adjacent to a sophisticated commercial strip. \nThe Capitalway is a high-end mix-used project developed by the real estate giant, the WaterWay Developments Company across 42 acres of land in eastern Cairo.\nThe Capitalway Compound isn't just a place to invest or live; it's a project where people will enjoy the endless facilities, an ideal location, and a wide array of upscale properties for sale that come with diverse layouts and prices. \nThe Capital Way New Capital Project is the perfect place for both investors and residents who want to enjoy the finer things while investing wisely in New Capital City. \n		Cairo		11511	8532000	853200	0	0	f	Primary	The Capitalway		2	1	120	0	0	2	f	Apartment	t	t	f	0	Landmark View	[]	["/uploads/properties/a31cdfee2887fbaa3e6c377343ffd52c"]	0	0	2025-04-25T21:44:33.897Z	1	published	1	\N	\N	Egypt	
45	3 Bedrooms Apartment in The Capitalway	Apartment for sale in The Capitalway - New Capital With installments over 6 years\n\nCapitalway by The WaterWay Developments is one of the most dazzling mixed-used projects in Egypt. It covers a massive area of 42 acres of land. The Capitalway New Capital merges transformative architecture with aesthetic landscapes and water features to generate a residential haven adjacent to a sophisticated commercial strip. \nThe Capitalway is a high-end mix-used project developed by the real estate giant, the WaterWay Developments Company across 42 acres of land in eastern Cairo.\nThe Capitalway Compound isn't just a place to invest or live; it's a project where people will enjoy the endless facilities, an ideal location, and a wide array of upscale properties for sale that come with diverse layouts and prices. \nThe Capital Way New Capital Project is the perfect place for both investors and residents who want to enjoy the finer things while investing wisely in New Capital City. \n		Cairo		11511	11419000	1141900	0	0	f	Primary	The Capitalway		3	2	175	0	0	3	f	Apartment	f	t	f	0	Garden View	[]	["/uploads/properties/859bf172115e2320c72820c47fb3b292"]	0	0	2025-04-25T21:47:00.595Z	1	published	1	\N	\N	Egypt	
46	4 Bedrooms Apartment in The Capitalway	Apartment for sale in The Capitalway - New Capital With installments over 6 years\n\nCapitalway by The WaterWay Developments is one of the most dazzling mixed-used projects in Egypt. It covers a massive area of 42 acres of land. The Capitalway New Capital merges transformative architecture with aesthetic landscapes and water features to generate a residential haven adjacent to a sophisticated commercial strip. \nThe Capitalway is a high-end mix-used project developed by the real estate giant, the WaterWay Developments Company across 42 acres of land in eastern Cairo.\nThe Capitalway Compound isn't just a place to invest or live; it's a project where people will enjoy the endless facilities, an ideal location, and a wide array of upscale properties for sale that come with diverse layouts and prices. \nThe Capital Way New Capital Project is the perfect place for both investors and residents who want to enjoy the finer things while investing wisely in New Capital City. \n		Cairo		11511	16230000	1623000	0	0	f	Primary	The Capitalway		4	2	280	0	0	4	f	Apartment	f	t	f	0	Landmark View	[]	["/uploads/properties/0241c583ee0b3ffbf2e6f42272530d19"]	0	0	2025-04-25T21:49:27.274Z	1	published	1	\N	\N	Egypt	
47	Duplex 338m in The Capitalway	Duplex for sale in The Capitalway - New Capital With installments over 6 years\n\nCapitalway by The WaterWay Developments is one of the most dazzling mixed-used projects in Egypt. It covers a massive area of 42 acres of land. The Capitalway New Capital merges transformative architecture with aesthetic landscapes and water features to generate a residential haven adjacent to a sophisticated commercial strip. \nThe Capitalway is a high-end mix-used project developed by the real estate giant, the WaterWay Developments Company across 42 acres of land in eastern Cairo.\nThe Capitalway Compound isn't just a place to invest or live; it's a project where people will enjoy the endless facilities, an ideal location, and a wide array of upscale properties for sale that come with diverse layouts and prices. \nThe Capital Way New Capital Project is the perfect place for both investors and residents who want to enjoy the finer things while investing wisely in New Capital City. \n		Cairo		11511	22323000	2232300	0	0	f	Primary	The Capitalway		4	3	338	0	0	1	f	Apartment	f	t	f	0	Garden View	[]	["/uploads/properties/a9b29d42c5f67aa66395fc493806beca"]	0	0	2025-04-25T21:52:29.065Z	1	published	1	\N	\N	Egypt	
48	1 Bedroom Apartment in W Signature	Apartment Shell & Core  \n15% Down Payment - 15% after 3 months  &  installments over 5 Years\n\nW Signature Waterway Compound is one of the high-end developments in New Cairo. It is a luxurious gated community, ideally located in Fifth Settlement. The project is in proximity to many of the important destinations in the area. \n\nThe Waterway Developments built a notable collection of units in WSignature New Cairo, for sale at different price rates.\n\nW Signature Waterway New Cairo is a tranquil gated community, developed for those seeking a serene lifestyle in the heart of the city. The developer built the compound over 27 acres in Fifth Settlement, and dedicated a large area of the project to open spaces.\n\nThe beautiful open spaces of WSignature Compound are comprised of lush landscapes and water bodies, where homeowners can enjoy an exquisite outdoor experience. There are jogging tracks and cycling trails amid its greenery, motivating the residents to start their day with a refreshing activity.		Cairo		11511	14265000	2139750	0	0	f	Primary	W Signature		1	1	130	0	0	2	f	Apartment	f	t	f	0	Garden View	[]	["/uploads/properties/2a31a6cc5bf7e3131568abe469d069c7"]	0	0	2025-04-26T13:41:26.226Z	1	published	1	\N	\N	Egypt	
50	3 Bedrooms Apartment in W Signature	Apartment Shell & Core  \n15% Down Payment - 15% after 3 months  &  installments over 5 Years\n\nW Signature Waterway Compound is one of the high-end developments in New Cairo. It is a luxurious gated community, ideally located in Fifth Settlement. The project is in proximity to many of the important destinations in the area. \n\nThe Waterway Developments built a notable collection of units in WSignature New Cairo, for sale at different price rates.\n\nW Signature Waterway New Cairo is a tranquil gated community, developed for those seeking a serene lifestyle in the heart of the city. The developer built the compound over 27 acres in Fifth Settlement, and dedicated a large area of the project to open spaces.\n\nThe beautiful open spaces of WSignature Compound are comprised of lush landscapes and water bodies, where homeowners can enjoy an exquisite outdoor experience. There are jogging tracks and cycling trails amid its greenery, motivating the residents to start their day with a refreshing activity.		Cairo		11511	25545000	3831750	0	0	f	Primary	W Signature		3	2	229	0	0	3	f	Apartment	f	t	f	0	Landmark View	[]	["/uploads/properties/2a31a6cc5bf7e3131568abe469d069c7"]	0	0	2025-04-26T13:46:34.936Z	1	published	1	\N	\N	Egypt	
51	Middle Townhouse in Sodic East	Town house - Ground + 1st  - Shell & Core  \n5% Downpayment, 5% after 3 months, 10% after another 3 months and the rest over 8 years\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\n\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\n\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n		Cairo		11511	24427000	1221350	0	0	f	Primary	Sodic East		3	2	221	331	0	0	f	Townhouse	f	t	f	0	Garden View	[]	["/uploads/properties/853e6dd314f88e7527c247b3b797391d"]	0	0	2025-04-26T16:47:31.898Z	1	published	1	\N	\N	Egypt	
52	Corner Town house in Sodic East	Town house - Ground + 1st  - Shell & Core  \n5% Downpayment, 5% after 3 months, 10% after another 3 months and the rest over 8 years\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\n\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\n\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n		Cairo		11511	31000000	1550000	0	0	f	Primary	Sodic East		3	2	221	319	0	0	f	Townhouse	f	t	f	0	Garden View	[]	["/uploads/properties/853e6dd314f88e7527c247b3b797391d"]	0	0	2025-04-26T16:56:33.112Z	1	published	1	\N	\N	Egypt	
53	SV For sale in Sodic East	SVilla - Ground + 1st  - Shell & Core  \n5% Downpayment, 5% after 3 months, 10% after another 3 months and the rest over 8 years\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\n\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\n\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n		Cairo		11511	42965000	2148250	0	0	f	Primary	Sodic East		3	3	237	439	0	0	f	Villa	f	t	f	0		[]	["/uploads/properties/833f5f1640328c980d98e3829552b20b"]	0	0	2025-04-26T17:24:40.582Z	1	published	1	\N	\N	Egypt	
54	MV for sale in Sodic East	M Villa - Ground + 1st  - Fully Finished  \n5% Downpayment, 5% after 3 months, 10% after another 3 months and the rest over 8 years\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\n\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\n\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n		Cairo		11511	56265000	2813250	0	0	f	Primary	Sodic East		4	5	326	505	0	0	f	Villa	t	t	f	0	Landmark View	[]	["/uploads/properties/833f5f1640328c980d98e3829552b20b"]	0	0	2025-04-26T17:42:55.963Z	1	published	1	\N	\N	Egypt	
49	2 Bedrooms Apartment in W Signature	Apartment Shell & Core  \n15% Down Payment - 15% after 3 months  &  installments over 5 Years\n\nW Signature Waterway Compound is one of the high-end developments in New Cairo. It is a luxurious gated community, ideally located in Fifth Settlement. The project is in proximity to many of the important destinations in the area. \n\nThe Waterway Developments built a notable collection of units in WSignature New Cairo, for sale at different price rates.\n\nW Signature Waterway New Cairo is a tranquil gated community, developed for those seeking a serene lifestyle in the heart of the city. The developer built the compound over 27 acres in Fifth Settlement, and dedicated a large area of the project to open spaces.\n\nThe beautiful open spaces of WSignature Compound are comprised of lush landscapes and water bodies, where homeowners can enjoy an exquisite outdoor experience. There are jogging tracks and cycling trails amid its greenery, motivating the residents to start their day with a refreshing activity.		Cairo		11511	17495000	2624250	0	8	f	Primary	W Signature		2	1	156	0	0	2	f	Apartment	f	t	f	0	Landmark View	[]	["/uploads/properties/2a31a6cc5bf7e3131568abe469d069c7"]	0	0	2025-04-26T13:44:10.536Z	1	published	1	\N	\N	Egypt	
55	LV for sale in Sodic East	Large Villa - Ground + 1st + Roof 139m - Fully Finished\n\n5% Down payment, 5% after 3 months, 10% after another 3 months and the rest over 8 years\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\n\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\n\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n		Cairo		11511	62237000	3111850	0	0	f	Primary	Sodic East	Sodic	4	5	392	555	0	0	f	villa	t	f	f	\N	Garden View	[]	["/uploads/properties/833f5f1640328c980d98e3829552b20b"]	0	0	2025-04-26T17:47:06.788Z	1	published	1	\N	\N	Egypt	
38	Standalone Villa for sale in Stone Park 400m	Fully Finished -    Maid's room + Toilet    - Guest Toilet -    Storage room -   Laundry room\nPergola - Parking Slot \n\nStone Park is an integrated residential complex, developed by Roya Developments across 450 acres of land in New Cairo. It was built to offer all serenity seekers a perfect living destination with the lavishness an urban living experience brings.\n\nRoya Developments designed the master plan of Stone Park New Cairo Compound, sketching a wide range of fancy facilities and luxurious units, all spread over lush greenery. The project was developed with utter sophistication and modernity, harmoniously merging with sustainability elements. \n\nMoreover, to offer residents a seamless life, the developer included security measures and high-end services in the project. It also chose the location of Stone Park Compound in New Cairo smartly, ideally building it in the Fifth Settlement. Roya made sure your commute to and from the compound was easy and convenient. 		Cairo		11511	1	0	0	0	f	Resale	Stone Park		4	6	400	600	0	0	f	Villa	f	t	t	0	Garden View	[]	["/uploads/properties/68afd57d5e6213040b927b6a6a4698d8"]	0	0	2025-04-24T21:47:57.006Z	1	published	1	\N	\N	Egypt	PROP-123456
42	Duplex 422m in The View	Garden Duplex for sale in The View with installments over 6 Years\n\nThe Waterway Developments' real estate evolution continues at pace, as its most recent new developments are set to become famous landmarks due to their striking design, the modern-day heirs to iconic buildings and commercial ventures. As a world class real estate trendsetter with intense experiences of the various projects, The Waterway Developments presents THE VIEW, a new upcoming, luxury love affair mixed use project, dominating a new address in town; To View Life in Full View.\n\nThe Waterway Developments invites you to THE VIEW, the next high-end community complex and a generously appointed land surface that will reign on supreme royalty housing and luxury services in the heart of New Cairo. Since the planning and designing of mixed-use neighborhoods and individual developments are on the rise, our developments present and feature a variety of offerings, bringing many of life's daily conveniences to one place.\n		Cairo		11511	58905000	5890500	0	0	f	Primary	The View Waterway		3	3	422	0	0	1	f	Apartment	t	t	t	0		[]	["/uploads/properties/36c58a102b40a02e66cad805a6ad5604"]	0	0	2025-04-25T21:23:03.853Z	1	published	1	\N	\N	Egypt	PROP-987654
12	Twin house for sale in Mivida	Twin house parcel 14.   -    Ground + First floor+ penthouse. -   Kitchenette in first floor \n\nMivida in New Cairo’s Golden Square by Emaar Misr is a mind-blowing and capturing compound created to cater to all your needs and offer you the comfortable luxurious life you deserve. \n\nTranslated as “My Life” in Spanish, the word Mivida and the compound are not just a mixed-use luxurious green complex rather, it is a whole new concept of life introduced in New Cairo by the real estate giant - Emaar Misr. The project rolls over a massive land area of 890 acres and it is comprised of several neighborhoods. \n\nEmaar created Mivida to be an eco-friendly green community that works according to the goals and rules of sustainable development.\n\nAnd when it comes to describing the architecture and design of the compound, the best thing we can say is what the developer said: “Mivida homes are all reminiscent of contemporary Santa Barbara and Tuscan architecture which is originally inspired by a unique blend of Spanish and Mediterranean design.”\n\nSimply, Mivida is offering you a whole new concept of living worth exploring.	Project Address	Cairo	East cairo	11511	45000000	0	0	0	t	Resale	Mivida	Emaar	3	4	330	340	0	0	f	Twinhouse	t	t	f	\N		["Swimmingpool"]	["/uploads/properties/81d1b263f08f6105a84e52394d9dc42b", "/uploads/properties/19d7cf2d282781b462cc07e548116757", "/uploads/properties/d569458c11b6d9ec97e81886bd74c056"]	0	0	2025-04-24T16:41:22.260Z	1	published	1	\N	\N	Egypt	
60	Get the best 	Golf course 	Project Address	Cairo	Cairo	11511	33000000	0	0	0	t	Resale	City Gate	Qatari Diar	4	5	270	\N	\N	\N	f	penthouse	f	t	f	\N	\N	[]	["/uploads/properties/images-1746009695634-821164859.jpeg", "/uploads/properties/images-1746009697225-280387935.jpeg", "/uploads/properties/images-1746009698381-943784522.jpeg", "/uploads/properties/images-1746725548370-480332882.png", "/uploads/properties/images-1746725556545-586121851.png", "/uploads/properties/images-1746725607323-754832408.png", "/uploads/properties/images-1746725617240-130323108.png"]	\N	\N	2025-04-30T10:40:48.941Z	1	active	1	\N	\N	Egypt	
61	Duplex for sale in village gate	Let’s see if it uplods	Project Address	Cairo	Cairo	11511	34000000	0	0	0	t	Resale	Mivida 	Emaar	4	5	270	\N	\N	\N	f	apartment	f	t	f	\N	\N	[]	["/uploads/properties/images-1746696892536-201127043.jpeg", "/uploads/properties/images-1746696893049-542701262.jpeg", "/uploads/properties/images-1746696893107-169289538.jpeg", "/uploads/properties/images-1746791884378-9352029.jpg", "/uploads/properties/images-1746791886669-440529711.jpg"]	\N	\N	2025-05-08T09:34:50.704Z	1	published	1	\N	\N	Egypt	
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
K0Y7Iabhe6KCH1AesTXMBUEXlvn8Qf6Y	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-18T19:48:07.513Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 18:23:27
0f-aRaM3BiNmyYibIYkcaeOd8DNG6Dam	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-11T14:33:28.029Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-17 11:27:42
p1nw0jNB8-gPIqiUuHVHUiVFM2RzsZ2k	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T22:02:26.705Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-08 22:02:27
jmPl_FaVRnuEFBpd20jSKFOkSskNRG-8	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T09:30:35.349Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-07 11:16:35
tt_QJi4v87u_WwkRDWeI7hqeNx168L9k	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T11:52:22.893Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-08 12:08:04
YrmaV_5ScaP_Q6ljmxpEDHsftaaXRjdr	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-09T09:44:22.511Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-09 09:44:23
TnSxEF8M9HHiol1S2Fsl2rVLmU-fp4Mh	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-10T05:48:42.491Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-10 05:48:43
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
1	owner	8b7c57454726c58b9cb383059f79a27b8f55dff7d7be529b9876090977ad2918efc08698c2d22f4975bfbce9caebfd8930b65140c1a3152093eb948c17900267.9d43194803f983847e8cbf91e88ff4d2	owner@theviews.com	System Owner	\N	t	2025-04-04T05:33:01.546Z	owner	\N	t
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

SELECT pg_catalog.setval('public.properties_id_seq', 69, true);


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

