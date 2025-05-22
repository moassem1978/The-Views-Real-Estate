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
5	Premium Villa for sale in Stone park	Fully Finished -    Maid's room + Toilet    - Guest Toilet -    Storage room -   Laundry room - 4Master bedrooms\nPergola - Parking Slot \n\nLake view\n\nStone Park is an integrated residential complex, developed by Roya Developments across 450 acres of land in New Cairo. It was built to offer all serenity seekers a perfect living destination with the lavishness an urban living experience brings.\n\nRoya Developments designed the master plan of Stone Park New Cairo Compound, sketching a wide range of fancy facilities and luxurious units, all spread over lush greenery. The project was developed with utter sophistication and modernity, harmoniously merging with sustainability elements. \nMoreover, to offer residents a seamless life, the developer included security measures and high-end services in the project. It also chose the location of Stone Park Compound in New Cairo smartly, ideally building it in the Fifth Settlement. Roya made sure your commute to and from the compound was easy and convenient.\n	Stone park	Cairo	Cairo	11511	1	0	0	0	f	Primary	Stone park	Roaya	4	6	400	400	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747818181567-455.jpeg", "/uploads/properties/images-1747818191858-527.jpeg", "/uploads/properties/images-1747818197275-116.jpeg"]	\N	\N	2025-05-21T09:02:59.678Z	1	published	1	\N	\N	Egypt	\N
2	Prime location Duplex in village gate	Prime Location - Fully Finished - Central AC's & Heating - Fully home automated \n\n\nThe Village Gate Compound is a distinguishing contemporary project developed by Palm Hills over 31 acres of land in the heart of New Cairo. It was built to merge between all the factors composing serene and luxurious lifestyles. \nPalm Hills Developments perfectly constructed a fancy collection of units in The Village Gate New Cairo that cater to various family needs and preferences. They are accompanied by a myriad of high-end amenities, granting homeowners a seamless living experience at its finest. \nFor a trouble-free experience outside the compound as well, Palm Hills ideally located at The Village Gate in New Cairo to be near several main roads, ensuring its residents easy commuting to anywhere they want to reach.\n	Village gate 	Cairo	Cairo	11511	17000000	0	0	0	f	Resale	Village gate 	Palm hills 	3	2	195	0	50	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747740911561-18.png", "/uploads/properties/images-1747740917498-354.png", "/uploads/properties/images-1747740922339-859.jpeg"]	\N	\N	2025-05-20T19:25:43.499Z	1	published	1	\N	\N	Egypt	\N
4	Stand-alone villa in Dyar 	Standalone Villa -      Ground + 1st + Roof      - Semi Finished \n\nDyar compound is one of the top-notch residential compounds in New Cairo. It is brought to the real estate scene by ARCO developments. The compound is full of high-end amenities and services that make your life there a unique one. \nAlso, Dyar Compound enjoys a wide range of unique selling points, including its premium location in New Cairo City and the amenities it has to offer to its residents.\n	Dyar	Cairo	Cairo	11511	35000000	0	0	0	f	Resale	Dyar	Arco	4	5	370	0	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747817547421-938.jpeg", "/uploads/properties/images-1747817550072-729.jpeg", "/uploads/properties/images-1747817551998-283.jpeg"]	\N	\N	2025-05-21T08:52:25.026Z	1	published	1	\N	\N	Egypt	\N
6	Apartment for sale in Swan lake	Lake view  The Phoenix  - Wide View \nRemaining installments: 1,257,480 Till 2028\nDelivery Date: Q2 / 2026\n\nThe Phoenix Neighborhood is one of the elite phases of Swan Lake Residences New Cairo, developed by the real estate tycoon, Hassan Allam Properties. The project sprawls over 460 acres of total land area. It boasts a broad array of amenities, all aimed at homeowners’ utmost satisfaction and comfort. \nThe Phoenix Swan Lake Residences location is in New Cairo, in proximity to its popular attractions, such as El Rehab and Cairo Festival City Mall. \nSwan Lake Residence is a mixed-use project by the leading developer, Hassan Allam Properties, in New Cairo. In order to revitalize Cairo's beloved east side, twelve upscale gated communities converge in one central location. Everyone can eventually experience the finest essence of life at Swan Lake Residence, where elegant living options are thoughtfully crafted to suit unique culture, architectural symmetry, and timeless accuracy.\nThe project, which spans more than 460 acres and is a mixed-use development by Hassan Allam Properties, consists of office park space, retail and commercial space, a boutique hotel, and low- and mid-rise residential components.\n	Swan lake	Cairo	Cairo	11511	8700000	7442520	0	0	f	Resale	Swan lake	Hassan Allam	2	1	93	0	0	4	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747850481621-202.png", "/uploads/properties/images-1747850496098-113.png", "/uploads/properties/images-1747850496294-818.png"]	\N	\N	2025-05-21T18:01:20.259Z	1	published	1	\N	\N	Egypt	\N
8	Fully Finished Apartment in Westown	Fully Finished Apartment with AC's & Kitchen \nMaid's room + Toilet\n\nSODIC West is one of the fanciest projects in Egypt, and Westown Residence El Sheikh Zayed is considered one of its state-of-the-art sub-compounds which boasts an elite collection of units and distinguishing amenities. \nSODIC designed a master plan for the Westown Residence Compound to sketch its high-end facilities and luxurious homes. It also made sure the project was a natural haven to offer homeowners a serene living environment at its finest. Not to mention that, for a comfortable experience, it included a variety of services in the project too.\nMoreover, the location of Westown Residence was ideally picked in El Sheikh Zayed, for a seamless commute. It is also in proximity to many of the popular destinations inside the SODIC West Compound.\n	Westown	Zayed	Cairo	11511	16750000	0	0	0	f	Resale	Westown	Sodic	3	2	209	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747851791933-186.jpeg", "/uploads/properties/images-1747851794991-584.jpeg", "/uploads/properties/images-1747851796332-865.jpeg", "/uploads/properties/images-1747851797985-504.jpeg"]	\N	\N	2025-05-21T18:23:09.864Z	1	published	1	\N	\N	Egypt	\N
9	Apartment for sale in Zed west	Residential Tower - Fully Finished with AC's \n\nZED Skeikh Zayed Towers is a residential phase inside the huge project Zed El Sheik Zayed. The project is brought to the real estate scene by Ora Developers. \n\nOnce again upending the real estate market, ZED Tower, the company's last tower, is committed to taking the idea of refinement even higher than any other Cairo construction. With all your requirements taken care of, the Tower is a luxurious take on a model high-rise residence that exudes sophistication, distinction, and a sense of home. Among the serviced houses are stunning apartments that are necessary rather than only a wish.\n	Zed west	Zayed	Zayed	00000	9500000	0	0	0	f	Resale	Zed west	Ora Development 	2	2	100	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747852358451-306.png", "/uploads/properties/images-1747852395302-495.png", "/uploads/properties/images-1747852399432-376.png"]	\N	\N	2025-05-21T18:32:37.260Z	1	published	1	\N	\N	Egypt	\N
10	LV for sale in Sodic East	Large Villa - Ground + 1st + Roof 139m - Fully Finished\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East	Cairo	Cairo	11511	62237000	3111850	0	0	f	Primary	Sodic East	Sodic	4	5	392	555	389	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747859077567-945.jpeg", "/uploads/properties/images-1747859113292-468.png", "/uploads/properties/images-1747859128714-564.png"]	\N	\N	2025-05-21T20:09:57.358Z	1	published	1	\N	\N	Egypt	\N
7	Exclusive Villa in lake view	Extremely prime location\nBasement + Ground + First Floor\n4 Master Bedrooms - Laundry room - Maid's room – Gym\n\nLake View Compound is one of the most elite projects in New Cairo, developed by El Hazek over 300 acres of land in the Fifth Settlement. The project features a broad array of elite amenities that are aimed at the residents’ ultimate convenience. \nThe developer of Lake View Residence designed a master plan for the compound exhibiting a myriad of high-end facilities, open spaces, and luxurious units. From essential facilities to recreational spaces, the project perfectly merges architectural innovation and vital resources. \nAdditionally, for the utmost comfort of homeowners, El Hazek smartly chose the location of Lake View Residence Compound in New Cairo. It is in the Golden Square and close to many popular destinations and main roads in the area. \n	Lake view	Cairo	Cairo	11511	1	0	0	0	f	Resale	Lake view	Lake view development 	4	5	1500	1500	1000	0	f	villa	t	t	t	\N	\N	{}	["/uploads/properties/images-1747851291765-604.jpeg", "/uploads/properties/images-1747851294365-268.jpeg", "/uploads/properties/images-1747851297459-120.jpeg", "/uploads/properties/images-1747851301594-225.jpeg"]	\N	\N	2025-05-21T18:14:49.997Z	1	published	1	\N	\N	Egypt	\N
11	MV for sale in Sodic East	M Villa - Ground + 1st  - Fully Finished  - Roof:103Sqm\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East	Cairo	Cairo	11511	56265000	2813250	0	0	f	Primary	Sodic East	Sodic	4	5	326	505	368	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747859823416-775.png", "/uploads/properties/images-1747859867901-450.png"]	\N	\N	2025-05-21T20:36:54.185Z	1	published	1	\N	\N	Egypt	\N
12	Fully Finished SV in Sodic East	S Villa - Ground + 1st  - Fully Finished  - Roof Area: 78 sqm\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East	Cairo	Cairo	11511	41360000	2068000	0	0	f	Primary	Sodic East	Sodic	3	4	237	415	317	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747911609505-238.jpeg", "/uploads/properties/images-1747911624928-218.png"]	\N	\N	2025-05-22T11:00:08.897Z	1	published	1	\N	\N	Egypt	\N
13	Fully Finished Town house in Sodic East	Middle Town house - Ground + 1st \nRoof Area: 71sqm\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East 	Cairo	Cairo	11511	29993000	1499650	0	0	f	Primary	Sodic East 	Sodic 	3	2	219	220	127	0	f	townhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747912026480-811.jpeg", "/uploads/properties/images-1747912037668-159.png"]	\N	\N	2025-05-22T11:07:05.976Z	1	published	1	\N	\N	Egypt	\N
1	Corner townhouse in Sodic East	Town house - Ground + 1st  - Shell & Core \n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East	Cairo	Cairo	11511	31000000	1550000	0	0	f	Primary	Sodic East	Sodic	3	2	221	0	0	0	f	townhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747756230673-544.png", "/uploads/properties/images-1747756234859-438.png", "/uploads/properties/images-1747756238155-900.png"]	\N	\N	2025-05-20T15:50:29.633Z	1	published	1	\N	\N	Egypt	\N
17	Premium Villa for sale in hacienda bay	Water villa - lagoon view\n\nHacienda Bay Sidi Abdel Rahman Resort is one of the finest projects in the North Coast by Palm Hills Developments, reshaping the coastal living experience. It spreads across 2.4 million sqm in the North Coast, featuring high-end facilities and luxurious beach houses.\nPalm Hills elevated the standards of summertime fun, comfort, and luxury in Hacienda Bay North Coast Resort. The residents of Hacienda Bay will not only experience the beauty of the Mediterranean Sea but also the resort’s distinguishing amenities. \nThe premium amenities of Hacienda Bay vary from your gateway to a tranquil vacation to safety, convenience, lavishness, and your family’s most exciting summer. \nPalm Hills made sure your stay in Hacienda Bay Sidi Abdel Rahman will go beyond convenience, that’s why it turned every sqm of the project to reflect a coastal haven.\n	Hacienda bay	North coast	North coast	23511	50000000	0	0	0	f	Resale	Hacienda bay	Palm hills	4	5	500	1460	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747934848022-37.jpeg", "/uploads/properties/images-1747934850385-813.jpeg", "/uploads/properties/images-1747934852009-292.jpeg", "/uploads/properties/images-1747934853534-841.jpeg"]	\N	\N	2025-05-22T17:27:26.952Z	1	published	1	\N	\N	Egypt	\N
18	Stand-alone Villa for sale in Mivida	Ground + First floor+ penthouse\nValley view\nKitchenette in first floor \nSwimming pool\n\nMivida in New Cairo’s Golden Square by Emaar Misr is a mind-blowing and capturing compound created to cater to all your needs and offer you the comfortable luxurious life you deserve. \nTranslated as “My Life” in Spanish, the word Mivida and the compound are not just a mixed-use luxurious green complex rather, it is a whole new concept of life introduced in New Cairo by the real estate giant - Emaar Misr. The project rolls over a massive land area of 890 acres and it is comprised of several neighborhoods. \nEmaar created Mivida to be an eco-friendly green community that works according to the goals and rules of sustainable development.\nAnd when it comes to describing the architecture and design of the compound, the best thing we can say is what the developer said: “Mivida homes are all reminiscent of contemporary Santa Barbara and Tuscan architecture which is originally inspired by a unique blend of Spanish and Mediterranean design.”\nSimply, Mivida is offering you a whole new concept of living worth exploring.\n	Mivida	Cairo	Cairo	11511	45000000	0	0	0	f	Resale	Mivida	Emaar	3	4	330	340	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747937183870-707.jpeg", "/uploads/properties/images-1747937187141-759.jpeg", "/uploads/properties/images-1747937188583-262.jpeg"]	\N	\N	2025-05-22T18:06:22.917Z	1	published	1	\N	\N	Egypt	\N
19	Luxurious villa for sale in Marassi	Marassi Verona\nVilla direct on Lagoon\nPrivate pool\nGround + First floor\n5 master bedrooms\nPremium finishing\nMaid’s room + Driver’s room\n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.\n	Marassi	North coast	North coast	23511	6	0	0	0	f	Resale	Marassi	Emaar	5	7	466	700	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747938797732-369.jpeg", "/uploads/properties/images-1747938802881-9.jpeg", "/uploads/properties/images-1747938808042-697.jpeg", "/uploads/properties/images-1747938808536-304.jpeg"]	\N	\N	2025-05-22T18:33:17.223Z	1	published	1	\N	\N	Egypt	\N
20	3 IN 1 Chalet for sale in Hacienda west	Basement: 26 Sqm\nremaining 4,233,000 till 2032 \nParking Slot\n\nHacienda West in Ras El Hekma, North Coast is an exquisite summer gateway by the reputable developer, Palm Hills Developments.\nHacienda West is created to be a heavenly escape in Ras El Hekma, where you can unwind and chill with picturesque sea views, lush greenery, and endless activities. The high-end resort offers you a home away from home with all the luxuries of the city combined with everything you need for the perfect vacation.\n	Hacienda west	North coast	North coast	23511	25000000	20767000	0	0	f	Resale	Hacienda west	Palm Hills	3	3	221	0	332	0	f	chalet	f	t	f	\N	\N	{}	["/uploads/properties/images-1747939974014-87.png"]	\N	\N	2025-05-22T18:52:53.485Z	1	published	1	\N	\N	Egypt	\N
21	Prime Location Apartment in Marassi	Marassi Marina\nMaid’s room + toilet\nUpgraded kitchen & AC’s  \n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.\n	Marassi	North coast	North coast	23511	45000000	0	0	0	f	Resale	Marassi	Emaar	3	3	311	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747940480282-697.jpeg", "/uploads/properties/images-1747940484205-288.jpeg", "/uploads/properties/images-1747940487432-231.jpeg", "/uploads/properties/images-1747940489334-1000.jpeg"]	\N	\N	2025-05-22T19:01:19.238Z	1	published	1	\N	\N	Egypt	\N
22	Apartment for sale in Marassi Marina 2	Prime location\nDirect on Canal\nMaid’s + Toilet\n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.\n	Marassi	North coast	North coast	23511	35000000	0	0	0	f	Resale	Marassi	Emaar	3	3	198	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747941145405-488.png", "/uploads/properties/images-1747941149295-814.png", "/uploads/properties/images-1747941152060-901.jpeg"]	\N	\N	2025-05-22T19:12:24.287Z	1	published	1	\N	\N	Egypt	\N
23	Twin Villa for sale in swan lake residence 	Swan lake - Giselle\nGround, First & Roof\n4 bedrooms + Living room\nMaid’s room + Toilet\n\nGiselle Swan Lake is a high-end phase developed to complete the story of the success.\nFor nearly two decades, Hassan Allam Properties (HAP) has been instrumental in shaping residential areas that foster hand-picked lifestyles and vibrant communities.\nThis legacy continues with their latest ultra-premium destination: Swanlake Residences in New Cairo. Spanning 438 acres, this development features twelve exclusive gated neighborhoods that come together to create a high-end focal point, revitalizing Cairo’s beloved east side.\n\nGiselle is celebrated for its luxurious offerings and is inspired by a period of romanticism and aristocracy. This neighborhood embodies a harmonious lifestyle, showcasing an exquisite and contemporary ambiance that is ideal for new beginnings and lifelong charm.\n	Swan lake	Cairo	Cairo	11511	35000000	0	0	0	f	Resale	Swan lake	Hassan Allam	4	4	313	320	0	0	f	twinhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747942576670-261.png", "/uploads/properties/images-1747942596463-941.png", "/uploads/properties/images-1747942596489-810.png", "/uploads/properties/images-1747942596596-497.png"]	\N	\N	2025-05-22T19:36:15.592Z	1	published	1	\N	\N	Egypt	\N
24	Very prime Location Townhouse in Villette	Townhouse Middle\nLandscape view\n3 bedrooms + 2 Living rooms\nMaid’s room + Toilet\nReady to move\nSemi finished\nBahary\n\nSODIC introduced a green haven in the heart of New Cairo, Villette Compound. Villette is one of SODIC’s finest projects, offering the bewitching vibes of suburban tranquility and a refreshing atmosphere. It offers a one-of-a-kind living experience where the luxury of urban living merges with the peacefulness a sustainable lifestyle can bring.\nSODIC developed Villette Compound over 301 acres of land in New Cairo, combining premium elements essential to unraveling a comfortable and lavish lifestyle. It crafted a unique master plan for Villette New Cairo, featuring prime facilities and luxurious homes. \nSODIC also implemented a variety of services in Villette to offer you a convenient lifestyle at its finest, and located the compound in a strategic location in New Cairo so you can experience such convenience emerging from inside the project outwards as well.\n	Villette	Cairo	Cairo	11511	27500000	0	0	0	f	Resale	Villette	Sodic	3	3	259	245	0	0	f	townhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747943202442-505.png"]	\N	\N	2025-05-22T19:46:41.834Z	1	published	1	\N	\N	Egypt	\N
25	Fully Finished Apartment in Villette	Ready to move\n\nSODIC introduced a green haven in the heart of New Cairo, Villette Compound. Villette is one of SODIC’s finest projects, offering the bewitching vibes of suburban tranquility and a refreshing atmosphere. It offers a one-of-a-kind living experience where the luxury of urban living merges with the peacefulness a sustainable lifestyle can bring.\nSODIC developed Villette Compound over 301 acres of land in New Cairo, combining premium elements essential to unraveling a comfortable and lavish lifestyle. It crafted a unique master plan for Villette New Cairo, featuring prime facilities and luxurious homes. \nSODIC also implemented a variety of services in Villette to offer you a convenient lifestyle at its finest, and located the compound in a strategic location in New Cairo so you can experience such convenience emerging from inside the project outwards as well.\n	Villette 	Cairo	Cairo	11511	11500000	0	0	0	f	Resale	Villette 	Sodic	2	3	160	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747944645611-629.jpeg", "/uploads/properties/images-1747944664007-484.jpeg", "/uploads/properties/images-1747944746208-595.jpeg", "/uploads/properties/images-1747944748699-407.jpeg"]	\N	\N	2025-05-22T20:10:43.202Z	1	published	1	\N	\N	Egypt	\N
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.session (sid, sess, expire) FROM stdin;
HwymUPRMp6l016jVv6lvAAqgRMWNo5Bj	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T20:57:07.813Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 20:57:22
UvNX5eHiVqll4huTv_E3WPg_81xpoOAf	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-06-29T05:20:52.266Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-29 05:20:53
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
uZO6w0CIkj0SRIB37mIq3oSWh2D15mYG	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-04T11:18:39.099Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-04 11:18:40
fGO0xmPGwEfDX5bjtbGuXEJXcmfMGret	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-31T09:36:11.606Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-08 11:51:40
p1nw0jNB8-gPIqiUuHVHUiVFM2RzsZ2k	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-10T13:00:43.863Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-10 13:00:44
K0Y7Iabhe6KCH1AesTXMBUEXlvn8Qf6Y	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-18T19:48:07.513Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-24 18:23:27
0f-aRaM3BiNmyYibIYkcaeOd8DNG6Dam	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-11T14:33:28.029Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-17 11:27:42
jmPl_FaVRnuEFBpd20jSKFOkSskNRG-8	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T09:30:35.349Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-07 11:16:35
tt_QJi4v87u_WwkRDWeI7hqeNx168L9k	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-08T11:52:22.893Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-08 12:08:04
YrmaV_5ScaP_Q6ljmxpEDHsftaaXRjdr	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-09T09:44:22.511Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-09 09:44:23
X6sFmJSFEnGz7awtrFSnAU1tXCCzK3bc	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-06T20:15:20.205Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-06 20:15:21
2GO_z3ZTu1qERWLW48mBcuWBQiEhs0DJ	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-06T20:13:50.347Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-06 20:13:51
B4jPn_R8KT27PPIgmCxhHJx2cjKMBghz	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-04T11:14:52.496Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-04 11:14:53
TnSxEF8M9HHiol1S2Fsl2rVLmU-fp4Mh	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-10T12:59:19.606Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-10 12:59:20
TJVg3vG0-5JQR3FIUiSwxYovbmW0IUpe	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-06-29T16:40:00.464Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-29 16:40:01
LJVqzlsFrvsYCPbRYd3P1bZ9nZBrgpXy	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-05T11:41:40.644Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-05 11:41:41
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
1	owner	710155ceebd70a94c5f51dde0433f67e12220a85e3fe59c3f5a0f0d2107bab9d42f26f0ae597aff4c9342bc6275cc30fad0ae3988ba932e7d2c5e37cca4a1058.87c18985c4b5d67c071e631babba959f	owner@theviews.com	System Owner	\N	t	2025-04-04T05:33:01.546Z	owner	\N	t
2	Dina	6db0d437fe53359aafbf1b8f9abea096cb93ba0a9a3e68f2e061d025b0d418c2a3c0f9a0b055488a6968b8dbb0a8e6aab3e0ab60150d23c08d268b0e6649fe0b.405a94cd5000bccaf5592d15efc38709	assem@theviewsconsultancy.com	Dina Mohamed 		f	2025-04-04T13:44:32.994Z	admin	1	t
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 3, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.properties_id_seq', 25, true);


--
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


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

