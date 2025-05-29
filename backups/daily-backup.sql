--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
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
-- Name: articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    author_id integer NOT NULL,
    featured_image text,
    category text NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb,
    meta_title text,
    meta_description text,
    meta_keywords text,
    is_published boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    view_count integer DEFAULT 0,
    reading_time integer DEFAULT 0
);


--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    property_id integer,
    message text,
    source text NOT NULL,
    status text DEFAULT 'new'::text,
    created_at timestamp without time zone DEFAULT now(),
    followed_up_at timestamp without time zone
);


--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: newsletters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletters (
    id integer NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    interests jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    source text DEFAULT 'website'::text,
    subscribed_at timestamp without time zone DEFAULT now(),
    unsubscribed_at timestamp without time zone
);


--
-- Name: newsletters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: newsletters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletters_id_seq OWNED BY public.newsletters.id;


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
    images jsonb DEFAULT '[]'::jsonb NOT NULL,
    slug text,
    introduction text,
    master_plan text,
    location_details text,
    specs jsonb DEFAULT '{}'::jsonb,
    developer_name text,
    brochure_images jsonb DEFAULT '[]'::jsonb,
    live_images jsonb DEFAULT '[]'::jsonb,
    meta_title text,
    meta_description text,
    meta_keywords text,
    is_featured boolean DEFAULT false,
    is_highlighted boolean DEFAULT false
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
    is_active boolean DEFAULT true NOT NULL,
    password_hash text,
    first_name text,
    last_name text
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
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: newsletters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters ALTER COLUMN id SET DEFAULT nextval('public.newsletters_id_seq'::regclass);


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
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.articles (id, title, slug, excerpt, content, author_id, featured_image, category, tags, meta_title, meta_description, meta_keywords, is_published, is_featured, published_at, created_at, updated_at, view_count, reading_time) FROM stdin;
1	Luxury Real Estate Market Trends in 2025	luxury-real-estate-market-trends-2025	Discover the latest trends shaping the luxury real estate market in 2025, from sustainable living to smart home technology.	The luxury real estate market in 2025 is experiencing unprecedented transformation. High-net-worth individuals are increasingly prioritizing sustainability, with eco-friendly features becoming non-negotiable amenities. Smart home integration has evolved beyond basic automation to include AI-powered systems that learn and adapt to residents' preferences.\n\nWaterfront properties continue to command premium prices, particularly in emerging coastal markets. The demand for private estates with extensive grounds has surged, driven by the desire for privacy and space. International buyers are showing renewed interest in stable markets, with particular focus on properties offering citizenship by investment opportunities.\n\nInvestment patterns reveal a shift toward properties that can generate multiple revenue streams - from luxury vacation rentals to exclusive event hosting. The modern luxury buyer seeks properties that combine traditional craftsmanship with cutting-edge technology, creating spaces that are both timeless and forward-thinking.	1	\N	Market Insights	["luxury real estate", "market trends", "2025", "investment"]	Luxury Real Estate Market Trends 2025 | Expert Analysis	Explore the latest luxury real estate market trends for 2025. Expert insights on investment opportunities, pricing, and emerging markets.	luxury real estate, market trends, property investment, high-end properties	t	t	2025-05-24 06:33:06.971005	2025-05-24 06:33:06.971005	2025-05-24 06:33:06.971005	0	5
2	The Ultimate Guide to Buying Your First Luxury Property	ultimate-guide-buying-first-luxury-property	A comprehensive guide for first-time luxury property buyers, covering everything from financing to due diligence.	Purchasing your first luxury property represents a significant milestone and requires careful consideration beyond traditional real estate transactions. The luxury market operates with different standards, expectations, and processes that can surprise even experienced buyers.\n\nFinancial preparation extends beyond securing financing. Luxury properties often require substantial cash reserves for maintenance, insurance, and unexpected improvements. Private banking relationships become crucial, as traditional mortgages may not suit high-value transactions. Many luxury buyers benefit from portfolio lending options that consider total net worth rather than income ratios.\n\nDue diligence in luxury real estate involves specialized inspections that go far beyond standard property assessments. Historic properties may require heritage compliance reviews, while waterfront estates need comprehensive environmental assessments. Privacy considerations, from security systems to title confidentiality, require expert legal guidance.\n\nThe luxury market rewards patience and discretion. Many premium properties never appear on public listings, accessible only through established relationships with luxury specialists. Building these connections before you need them ensures access to exclusive opportunities that match your specific criteria.	1	\N	Buying Guide	["luxury property", "buying guide", "first time buyer", "investment"]	Ultimate Guide to Buying Luxury Property | Expert Tips	Complete guide for first-time luxury property buyers. Learn about financing, due diligence, and expert tips for successful purchases.	luxury property buying, first time luxury buyer, luxury real estate guide	t	f	2025-05-24 06:33:06.971005	2025-05-24 06:33:06.971005	2025-05-24 06:33:06.971005	0	8
3	Sustainable Luxury: Eco-Friendly Features That Add Value	sustainable-luxury-eco-friendly-features-value	How sustainable features and eco-friendly technologies are revolutionizing luxury real estate and adding significant value.	Sustainability has evolved from a trend to a fundamental requirement in luxury real estate. Today's discerning buyers expect properties that deliver exceptional comfort while minimizing environmental impact. This shift has created new opportunities for property values to appreciate through strategic sustainable investments.\n\nSolar energy systems have advanced beyond basic panels to include integrated storage solutions and smart grid connectivity. Luxury properties now feature sophisticated energy management systems that optimize consumption while maintaining perfect climate control. Geothermal systems provide efficient heating and cooling, particularly valuable in extreme climates.\n\nWater conservation technologies have become especially important in luxury markets. Rainwater harvesting systems, greywater recycling, and drought-resistant landscaping not only reduce environmental impact but also provide long-term cost savings. Private wells and water treatment systems ensure both sustainability and independence.\n\nGreen building materials and construction methods are creating properties that age better and require less maintenance. From reclaimed hardwood floors to low-emission insulation, these materials contribute to better indoor air quality and long-term durability. Smart home systems optimize energy usage while providing unprecedented control and monitoring capabilities.	1	\N	Investment Tips	["sustainable luxury", "eco-friendly", "green building", "property value"]	Sustainable Luxury Real Estate | Eco-Friendly Property Features	Discover how eco-friendly features add value to luxury properties. Learn about sustainable technologies transforming high-end real estate.	sustainable luxury real estate, eco-friendly properties, green building, luxury sustainability	t	t	2025-05-24 06:33:06.971005	2025-05-24 06:33:06.971005	2025-05-24 06:33:06.971005	0	6
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, email, first_name, last_name, phone, property_id, message, source, status, created_at, followed_up_at) FROM stdin;
\.


--
-- Data for Name: newsletters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletters (id, email, first_name, last_name, interests, is_active, source, subscribed_at, unsubscribed_at) FROM stdin;
1	newsletter.test@example.com	Mohamed Newsletter Test	\N	[]	t	footer	2025-05-26 06:03:28.480983	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, created_by, created_at, updated_at, project_name, description, location, about_developer, status, approved_by, unit_types, images, slug, introduction, master_plan, location_details, specs, developer_name, brochure_images, live_images, meta_title, meta_description, meta_keywords, is_featured, is_highlighted) FROM stdin;
4	\N	2025-05-28 20:09:35.97059	\N	Marassi North Coast	Marassi North Coast by EMAAR Misr is Egypt's premier luxury Mediterranean resort destination spanning 1,544 acres along the pristine North Coast. This flagship development features 6.5 kilometers of private beaches, an 18-hole championship golf course, luxury marina, and diverse residential options from beachfront villas to marina apartments. The master-planned community combines stunning natural beauty with world-class amenities, premium retail districts, and sophisticated dining venues, setting the gold standard for luxury coastal living in Egypt.	North Coast, Egypt - 125km west of Alexandria	EMAAR Misr is the Egyptian subsidiary of EMAAR Properties, the world-renowned developer behind iconic projects such as Burj Khalifa and The Dubai Mall. With over 25 years of global experience, EMAAR brings world-class expertise to the Egyptian market. EMAAR Misr is committed to developing landmark destinations that redefine luxury living standards in Egypt, combining international expertise with local market understanding to create exceptional communities that enhance Egypt's real estate landscape.	published	\N	[{"area": "300-800 sqm built-up area", "type": "Beachfront Villas", "bedrooms": "3-6 bedrooms", "features": ["Direct beach access", "Private swimming pool", "Landscaped garden", "Unobstructed sea views", "Premium finishing packages", "Smart home systems"], "bathrooms": "3-7 bathrooms"}, {"area": "250-600 sqm built-up area", "type": "Golf Course Villas", "bedrooms": "3-5 bedrooms", "features": ["Golf course frontage", "Private garden terraces", "Golf club membership included", "Landscaped surroundings", "Modern architectural design", "Premium amenities access"], "bathrooms": "3-6 bathrooms"}, {"area": "120-300 sqm built-up area", "type": "Marina Apartments", "bedrooms": "1-4 bedrooms", "features": ["Marina and yacht views", "Spacious balconies", "Contemporary design", "Resort-style amenities", "24/7 concierge services", "Beach club access"], "bathrooms": "1-4 bathrooms"}, {"area": "400-1000 sqm built-up area", "type": "Hilltop Estates", "bedrooms": "4-7 bedrooms", "features": ["Panoramic Mediterranean views", "Private elevator access", "Infinity swimming pools", "Expansive landscaped grounds", "Ultimate privacy and exclusivity", "Helicopter landing pad access"], "bathrooms": "4-8 bathrooms"}]	["https://www.emaarmisr.com/content/dam/emaar-misr/marassi/gallery/aerial-view.jpg", "https://www.emaarmisr.com/content/dam/emaar-misr/marassi/gallery/beach-club.jpg", "https://www.emaarmisr.com/content/dam/emaar-misr/marassi/gallery/golf-course.jpg", "https://www.emaarmisr.com/content/dam/emaar-misr/marassi/gallery/marina.jpg", "https://www.emaarmisr.com/content/dam/emaar-misr/marassi/gallery/villas.jpg"]	marassi-north-coast	Marassi North Coast represents the pinnacle of luxury coastal living in Egypt. This prestigious development by EMAAR Misr offers an unparalleled lifestyle experience with pristine beaches, world-class amenities, and architectural excellence.	\N	\N	{"phases": "Multiple phases", "totalArea": "1544 acres", "downPayment": "10% down payment", "deliveryDate": "2025-2027", "paymentPlans": "Up to 8 years", "beachfrontLength": "6.5km"}	EMAAR Misr	[]	[]	Marassi North Coast by EMAAR Misr | Luxury Beachfront Properties	Discover Marassi North Coast by EMAAR Misr - exclusive luxury villas, chalets and apartments on Egypt's pristine Mediterranean coastline.	Marassi North Coast, EMAAR Misr, luxury beachfront properties, North Coast Egypt, Mediterranean villas, premium chalets	t	t
5	1	2025-05-28 20:34:27.752157	\N	Marassi North Coast	An exclusive beachfront resort community by EMAAR Misr, featuring luxury villas, chalets, and apartments with direct Mediterranean access on Egypt's pristine North Coast.	North Coast, Egypt - 125km from Cairo	EMAAR Misr is the Egyptian arm of EMAAR Properties, the world-renowned developer behind iconic projects like Burj Khalifa and Dubai Mall. With decades of experience in luxury development, EMAAR brings international standards and exceptional quality to the Egyptian market.	published	\N	["Luxury Villas", "Beach Chalets", "Premium Apartments", "Penthouses", "Townhouses"]	["https://images.unsplash.com/photo-1582719471384-894fbb16e74f?w=800", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"]	marassi-north-coast	Marassi North Coast represents the pinnacle of luxury coastal living in Egypt. This prestigious development by EMAAR Misr offers an unparalleled lifestyle experience with pristine beaches, world-class amenities, and architectural excellence.	\N	\N	{"phases": "Multiple phases", "totalArea": "1544 acres", "downPayment": "10% down payment", "deliveryDate": "2025-2027", "paymentPlans": "Up to 8 years", "beachfrontLength": "6.5km"}	EMAAR Misr	[]	[]	Marassi North Coast by EMAAR Misr | Luxury Beachfront Properties	Discover Marassi North Coast by EMAAR Misr - exclusive luxury villas, chalets and apartments on Egypt's pristine Mediterranean coastline.	Marassi North Coast, EMAAR Misr, luxury beachfront properties, North Coast Egypt, Mediterranean villas, premium chalets	t	t
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
7	Exclusive Villa in lake view	Extremely prime location\nBasement + Ground + First Floor\n4 Master Bedrooms - Laundry room - Maid's room – Gym\n\nPrice: 6 Mil USD\n\nLake View Compound is one of the most elite projects in New Cairo, developed by El Hazek over 300 acres of land in the Fifth Settlement. The project features a broad array of elite amenities that are aimed at the residents’ ultimate convenience. \nThe developer of Lake View Residence designed a master plan for the compound exhibiting a myriad of high-end facilities, open spaces, and luxurious units. From essential facilities to recreational spaces, the project perfectly merges architectural innovation and vital resources. \nAdditionally, for the utmost comfort of homeowners, El Hazek smartly chose the location of Lake View Residence Compound in New Cairo. It is in the Golden Square and close to many popular destinations and main roads in the area. \n	Lake view	Cairo	Cairo	11511	300000000	0	0	0	f	Resale	Lake view	Lake view development 	4	5	1500	1500	1000	0	f	villa	t	t	t	\N	\N	{}	["/uploads/properties/images-1747851291765-604.jpeg", "/uploads/properties/images-1747851294365-268.jpeg", "/uploads/properties/images-1747851297459-120.jpeg", "/uploads/properties/images-1747851301594-225.jpeg"]	\N	\N	2025-05-21T18:14:49.997Z	1	published	1	\N	\N	Egypt	\N
11	MV for sale in Sodic East	M Villa - Ground + 1st  - Fully Finished  - Roof:103Sqm\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East	Cairo	Cairo	11511	56265000	2813250	0	0	f	Primary	Sodic East	Sodic	4	5	326	505	368	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747859823416-775.png", "/uploads/properties/images-1747859867901-450.png"]	\N	\N	2025-05-21T20:36:54.185Z	1	published	1	\N	\N	Egypt	\N
12	Fully Finished SV in Sodic East	S Villa - Ground + 1st  - Fully Finished  - Roof Area: 78 sqm\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East	Cairo	Cairo	11511	41360000	2068000	0	0	f	Primary	Sodic East	Sodic	3	4	237	415	317	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747911609505-238.jpeg", "/uploads/properties/images-1747911624928-218.png"]	\N	\N	2025-05-22T11:00:08.897Z	1	published	1	\N	\N	Egypt	\N
13	Fully Finished Town house in Sodic East	Middle Town house - Ground + 1st \nRoof Area: 71sqm\n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East 	Cairo	Cairo	11511	29993000	1499650	0	0	f	Primary	Sodic East 	Sodic 	3	2	219	220	127	0	f	townhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747912026480-811.jpeg", "/uploads/properties/images-1747912037668-159.png"]	\N	\N	2025-05-22T11:07:05.976Z	1	published	1	\N	\N	Egypt	\N
1	Corner townhouse in Sodic East	Town house - Ground + 1st  - Shell & Core \n\nSODIC East Compound is an elite project in New Heliopolis, developed for those not only looking for a luxurious home but also a one-of-a-kind community. It is a multi-generation destination, offering a tranquil and sustainable living experience in the heart of the city.\nSODIC East spreads across 665 acres of land in New Heliopolis, outlined by a unique master plan filled with exclusive facilities and fancy homes. SODIC made sure everything you need is near the comfort of your luxurious unit in the compound.\nThe comfortable lifestyle you will experience in SODIC East extends outwards as well, as the prime location of the compound grants you access to many popular destinations and easy commuting to anywhere you want to reach.\n	Sodic East	Cairo	Cairo	11511	31000000	1550000	0	0	f	Primary	Sodic East	Sodic	3	2	221	0	0	0	f	townhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747756230673-544.png", "/uploads/properties/images-1747756234859-438.png", "/uploads/properties/images-1747756238155-900.png"]	\N	\N	2025-05-20T15:50:29.633Z	1	published	1	\N	\N	Egypt	\N
17	Premium Villa for sale in hacienda bay	Water villa - lagoon view\n\nHacienda Bay Sidi Abdel Rahman Resort is one of the finest projects in the North Coast by Palm Hills Developments, reshaping the coastal living experience. It spreads across 2.4 million sqm in the North Coast, featuring high-end facilities and luxurious beach houses.\nPalm Hills elevated the standards of summertime fun, comfort, and luxury in Hacienda Bay North Coast Resort. The residents of Hacienda Bay will not only experience the beauty of the Mediterranean Sea but also the resort’s distinguishing amenities. \nThe premium amenities of Hacienda Bay vary from your gateway to a tranquil vacation to safety, convenience, lavishness, and your family’s most exciting summer. \nPalm Hills made sure your stay in Hacienda Bay Sidi Abdel Rahman will go beyond convenience, that’s why it turned every sqm of the project to reflect a coastal haven.\n	Hacienda bay	North coast	North coast	23511	50000000	0	0	0	f	Resale	Hacienda bay	Palm hills	4	5	500	1460	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747934848022-37.jpeg", "/uploads/properties/images-1747934850385-813.jpeg", "/uploads/properties/images-1747934852009-292.jpeg", "/uploads/properties/images-1747934853534-841.jpeg"]	\N	\N	2025-05-22T17:27:26.952Z	1	published	1	\N	\N	Egypt	\N
18	Stand-alone Villa for sale in Mivida	Ground + First floor+ penthouse\nValley view\nKitchenette in first floor \nSwimming pool\n\nMivida in New Cairo’s Golden Square by Emaar Misr is a mind-blowing and capturing compound created to cater to all your needs and offer you the comfortable luxurious life you deserve. \nTranslated as “My Life” in Spanish, the word Mivida and the compound are not just a mixed-use luxurious green complex rather, it is a whole new concept of life introduced in New Cairo by the real estate giant - Emaar Misr. The project rolls over a massive land area of 890 acres and it is comprised of several neighborhoods. \nEmaar created Mivida to be an eco-friendly green community that works according to the goals and rules of sustainable development.\nAnd when it comes to describing the architecture and design of the compound, the best thing we can say is what the developer said: “Mivida homes are all reminiscent of contemporary Santa Barbara and Tuscan architecture which is originally inspired by a unique blend of Spanish and Mediterranean design.”\nSimply, Mivida is offering you a whole new concept of living worth exploring.\n	Mivida	Cairo	Cairo	11511	45000000	0	0	0	f	Resale	Mivida	Emaar	3	4	330	340	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747937183870-707.jpeg", "/uploads/properties/images-1747937187141-759.jpeg", "/uploads/properties/images-1747937188583-262.jpeg"]	\N	\N	2025-05-22T18:06:22.917Z	1	published	1	\N	\N	Egypt	\N
20	3 IN 1 Chalet for sale in Hacienda west	Basement: 26 Sqm\nremaining 4,233,000 till 2032 \nParking Slot\n\nHacienda West in Ras El Hekma, North Coast is an exquisite summer gateway by the reputable developer, Palm Hills Developments.\nHacienda West is created to be a heavenly escape in Ras El Hekma, where you can unwind and chill with picturesque sea views, lush greenery, and endless activities. The high-end resort offers you a home away from home with all the luxuries of the city combined with everything you need for the perfect vacation.\n	Hacienda west	North coast	North coast	23511	25000000	20767000	0	0	f	Resale	Hacienda west	Palm Hills	3	3	221	0	332	0	f	chalet	f	t	f	\N	\N	{}	["/uploads/properties/images-1747939974014-87.png"]	\N	\N	2025-05-22T18:52:53.485Z	1	published	1	\N	\N	Egypt	\N
21	Prime Location Apartment in Marassi	Marassi Marina\nMaid’s room + toilet\nUpgraded kitchen & AC’s  \n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.\n	Marassi	North coast	North coast	23511	45000000	0	0	0	f	Resale	Marassi	Emaar	3	3	311	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747940480282-697.jpeg", "/uploads/properties/images-1747940484205-288.jpeg", "/uploads/properties/images-1747940487432-231.jpeg", "/uploads/properties/images-1747940489334-1000.jpeg"]	\N	\N	2025-05-22T19:01:19.238Z	1	published	1	\N	\N	Egypt	\N
22	Apartment for sale in Marassi Marina 2	Prime location\nDirect on Canal\nMaid’s + Toilet\n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.\n	Marassi	North coast	North coast	23511	35000000	0	0	0	f	Resale	Marassi	Emaar	3	3	198	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747941145405-488.png", "/uploads/properties/images-1747941149295-814.png", "/uploads/properties/images-1747941152060-901.jpeg"]	\N	\N	2025-05-22T19:12:24.287Z	1	published	1	\N	\N	Egypt	\N
23	Twin Villa for sale in swan lake residence 	Swan lake - Giselle\nGround, First & Roof\n4 bedrooms + Living room\nMaid’s room + Toilet\n\nGiselle Swan Lake is a high-end phase developed to complete the story of the success.\nFor nearly two decades, Hassan Allam Properties (HAP) has been instrumental in shaping residential areas that foster hand-picked lifestyles and vibrant communities.\nThis legacy continues with their latest ultra-premium destination: Swanlake Residences in New Cairo. Spanning 438 acres, this development features twelve exclusive gated neighborhoods that come together to create a high-end focal point, revitalizing Cairo’s beloved east side.\n\nGiselle is celebrated for its luxurious offerings and is inspired by a period of romanticism and aristocracy. This neighborhood embodies a harmonious lifestyle, showcasing an exquisite and contemporary ambiance that is ideal for new beginnings and lifelong charm.\n	Swan lake	Cairo	Cairo	11511	35000000	0	0	0	f	Resale	Swan lake	Hassan Allam	4	4	313	320	0	0	f	twinhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747942576670-261.png", "/uploads/properties/images-1747942596463-941.png", "/uploads/properties/images-1747942596489-810.png", "/uploads/properties/images-1747942596596-497.png"]	\N	\N	2025-05-22T19:36:15.592Z	1	published	1	\N	\N	Egypt	\N
24	Very prime Location Townhouse in Villette	Townhouse Middle\nLandscape view\n3 bedrooms + 2 Living rooms\nMaid’s room + Toilet\nReady to move\nSemi finished\nBahary\n\nSODIC introduced a green haven in the heart of New Cairo, Villette Compound. Villette is one of SODIC’s finest projects, offering the bewitching vibes of suburban tranquility and a refreshing atmosphere. It offers a one-of-a-kind living experience where the luxury of urban living merges with the peacefulness a sustainable lifestyle can bring.\nSODIC developed Villette Compound over 301 acres of land in New Cairo, combining premium elements essential to unraveling a comfortable and lavish lifestyle. It crafted a unique master plan for Villette New Cairo, featuring prime facilities and luxurious homes. \nSODIC also implemented a variety of services in Villette to offer you a convenient lifestyle at its finest, and located the compound in a strategic location in New Cairo so you can experience such convenience emerging from inside the project outwards as well.\n	Villette	Cairo	Cairo	11511	27500000	0	0	0	f	Resale	Villette	Sodic	3	3	259	245	0	0	f	townhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1747943202442-505.png"]	\N	\N	2025-05-22T19:46:41.834Z	1	published	1	\N	\N	Egypt	\N
25	Fully Finished Apartment in Villette	Ready to move\n\nSODIC introduced a green haven in the heart of New Cairo, Villette Compound. Villette is one of SODIC’s finest projects, offering the bewitching vibes of suburban tranquility and a refreshing atmosphere. It offers a one-of-a-kind living experience where the luxury of urban living merges with the peacefulness a sustainable lifestyle can bring.\nSODIC developed Villette Compound over 301 acres of land in New Cairo, combining premium elements essential to unraveling a comfortable and lavish lifestyle. It crafted a unique master plan for Villette New Cairo, featuring prime facilities and luxurious homes. \nSODIC also implemented a variety of services in Villette to offer you a convenient lifestyle at its finest, and located the compound in a strategic location in New Cairo so you can experience such convenience emerging from inside the project outwards as well.\n	Villette 	Cairo	Cairo	11511	11500000	0	0	0	f	Resale	Villette 	Sodic	2	3	160	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1747944645611-629.jpeg", "/uploads/properties/images-1747944664007-484.jpeg", "/uploads/properties/images-1747944746208-595.jpeg", "/uploads/properties/images-1747944748699-407.jpeg"]	\N	\N	2025-05-22T20:10:43.202Z	1	published	1	\N	\N	Egypt	\N
27	Chalet for sale in Katameya coast	Fully finished with AC’s\n2 Master bedrooms\nInstallments over 3 years\n\nStarlight Developments built Katameya Coast Resort over 205 acres in Ras El Hekma, North Coast. It is a flawless vacation destination with luxurious beach houses with uninterrupted sea views, high-end amenities, and boundless leisure activities. \n\n\nKatameya Coast North Coast is ideally located on the 180th km of Alexandria - Marsa Matrouh Road, in proximity to other luxurious projects in Ras El Hekma. Upon reaching the resort, vacationers get to unlock a beautiful coastal escapade where they can revive their minds and body, create unforgettable memories, and indulge in unlimited fun. \n\nThe Katameya Coast North Coast Project was designed over 7 levels of cascading platforms, granting its residents an uninterrupted view of the Mediterranean Sea. It features a 765m beachfront with a variety of activities, where a dip in the azure waters would refresh your mind and body. \n	Katameya Coast	North coast	North coast	23511	26250000	7875000	0	0	f	Primary	Katameya Coast	Starlight Developments	2	2	175	0	0	0	f	chalet	f	t	f	\N	\N	{}	["/uploads/properties/images-1748083645227-844.png", "/uploads/properties/images-1748083651272-317.png", "/uploads/properties/images-1748083654806-857.png", "/uploads/properties/images-1748083659608-816.png", "/uploads/properties/images-1748083662656-667.png"]	\N	\N	2025-05-24T10:47:23.541Z	1	published	1	\N	\N	Egypt	\N
26	Premium stand-alone Villa in Katameya coast	Fully finished with AC’s\nLevel 6\n5Master bedrooms\nMaid’s room + toilet\nInstallments over 3 years\n \nStarlight Developments built Katameya Coast Resort over 205 acres in Ras El Hekma, North Coast. It is a flawless vacation destination with luxurious beach houses with uninterrupted sea views, high-end amenities, and boundless leisure activities. \n\n\nKatameya Coast North Coast is ideally located on the 180th km of Alexandria - Marsa Matrouh Road, in proximity to other luxurious projects in Ras El Hekma. Upon reaching the resort, vacationers get to unlock a beautiful coastal escapade where they can revive their minds and body, create unforgettable memories, and indulge in unlimited fun. \n\nThe Katameya Coast North Coast Project was designed over 7 levels of cascading platforms, granting its residents an uninterrupted view of the Mediterranean Sea. It features a 765m beachfront with a variety of activities, where a dip in the azure waters would refresh your mind and body. \n	Katameya coast	North coast	North coast	23511	74550000	26092500	0	0	f	Primary	Katameya coast	Starlight Developments	5	6	315	960	0	0	f	villa	t	t	t	\N	\N	{}	["/uploads/properties/images-1748083086133-539.png", "/uploads/properties/images-1748083095559-515.png", "/uploads/properties/images-1748083108072-292.png", "/uploads/properties/images-1748083110303-874.png"]	\N	\N	2025-05-24T10:38:05.636Z	1	published	1	\N	\N	Egypt	\N
28	Apartment 225m in Katameya Creeks	Fully Finished\nInstallments over 3years\n\nKatameya Creeks in New Cairo is one of the finest, high-end projects by Starlight Developments.  \nWith a premium location and a wide array of upscale amenities, Katameya Creeks New Cairo stands out as a unique place to live.\nThe Katameya Creeks New Cairo has a skillfully designed master plan that is fully integrated and includes all the means of luxury and comfort.\nOn the 45 acres of land, stands this spacious Katameya Creeks New Cairo project that is filled to the brim with upscale amenities including a clubhouse, underground parking, commercial strip, and a business hub.\nAlso, you will find a mosque, bicycle lanes, a jogging trail, master suites, spacious hallways, roofed terraces, large windows, kitchen balconies, storage space, VRV units, a garbage shoot, gated retail services, a spa, gym, and lush greens.\n	Katameya creeks	Cairo	Cairo	11511	40500000	10125000	0	0	f	Primary	Katameya creeks	Starlight Developments 	2	2	225	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748086830297-746.png", "/uploads/properties/images-1748086849862-716.png", "/uploads/properties/images-1748086866725-995.png", "/uploads/properties/images-1748086880274-321.png"]	\N	\N	2025-05-24T11:40:29.172Z	1	published	1	\N	\N	Egypt	\N
30	Apartment 240m in Katameya Creeks	Fully Finished\nTerrace Area 23m\nInstallments over 3 years\n\nKatameya Creeks in New Cairo is one of the finest, high-end projects by Starlight Developments.  \nWith a premium location and a wide array of upscale amenities, Katameya Creeks New Cairo stands out as a unique place to live.\nThe Katameya Creeks New Cairo has a skillfully designed master plan that is fully integrated and includes all the means of luxury and comfort.\nOn the 45 acres of land, stands this spacious Katameya Creeks New Cairo project that is filled to the brim with upscale amenities including a clubhouse, underground parking, commercial strip, and a business hub.\nAlso, you will find a mosque, bicycle lanes, a jogging trail, master suites, spacious hallways, roofed terraces, large windows, kitchen balconies, storage space, VRV units, a garbage shoot, gated retail services, a spa, gym, and lush greens.\n	Katameya Coast	Cairo	Cairo	11511	43200000	10800000	0	0	f	Primary	Katameya Coast	Starlight Developments 	3	2	0	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748109234901-339.png", "/uploads/properties/images-1748109246459-477.png", "/uploads/properties/images-1748109271942-288.png", "/uploads/properties/images-1748109287573-663.png"]	\N	\N	2025-05-24T17:53:54.371Z	1	published	1	\N	\N	Egypt	\N
31	Apartment 163m in Katameya Creeks	Fully Finished\nInstallments over 3 years\nTerrace Area 23m\n\nKatameya Creeks in New Cairo is one of the finest, high-end projects by Starlight Developments.  \nWith a premium location and a wide array of upscale amenities, Katameya Creeks New Cairo stands out as a unique place to live.\nThe Katameya Creeks New Cairo has a skillfully designed master plan that is fully integrated and includes all the means of luxury and comfort.\nOn the 45 acres of land, stands this spacious Katameya Creeks New Cairo project that is filled to the brim with upscale amenities including a clubhouse, underground parking, commercial strip, and a business hub.\nAlso, you will find a mosque, bicycle lanes, a jogging trail, master suites, spacious hallways, roofed terraces, large windows, kitchen balconies, storage space, VRV units, a garbage shoot, gated retail services, a spa, gym, and lush greens.\n	Katameya Creeks	Cairo	Cairo	11511	29340000	7335000	0	0	f	Primary	Katameya Creeks	Starlight Developments 	2	2	163	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748109584465-159.png", "/uploads/properties/images-1748109598894-803.png", "/uploads/properties/images-1748109612382-425.png", "/uploads/properties/images-1748109624248-155.png"]	\N	\N	2025-05-24T17:59:43.947Z	1	published	1	\N	\N	Egypt	\N
29	Apartment 190m in Katameya Creeks 	Fully finished\nInstallments over 3 years\n\nKatameya Creeks in New Cairo is one of the finest, high-end projects by Starlight Developments.  \nWith a premium location and a wide array of upscale amenities, Katameya Creeks New Cairo stands out as a unique place to live.\nThe Katameya Creeks New Cairo has a skillfully designed master plan that is fully integrated and includes all the means of luxury and comfort.\nOn the 45 acres of land, stands this spacious Katameya Creeks New Cairo project that is filled to the brim with upscale amenities including a clubhouse, underground parking, commercial strip, and a business hub.\nAlso, you will find a mosque, bicycle lanes, a jogging trail, master suites, spacious hallways, roofed terraces, large windows, kitchen balconies, storage space, VRV units, a garbage shoot, gated retail services, a spa, gym, and lush greens.\n	Katameya Creeks 	Cairo	Cairo	11511	34200000	8550000	0	0	f	Primary	Katameya Creeks 	Starlight developments 	2	2	190	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748108677679-344.png", "/uploads/properties/images-1748108691273-418.png", "/uploads/properties/images-1748108704883-132.png", "/uploads/properties/images-1748108716540-163.png"]	\N	\N	2025-05-24T17:44:37.175Z	1	published	1	\N	\N	Egypt	\N
32	Stand-alone Villa in Katameya Creeks	Fully finished\nInstallments over 3 years\n\nKatameya Creeks in New Cairo is one of the finest, high-end projects by Starlight Developments.  \nWith a premium location and a wide array of upscale amenities, Katameya Creeks New Cairo stands out as a unique place to live.\nThe Katameya Creeks New Cairo has a skillfully designed master plan that is fully integrated and includes all the means of luxury and comfort.\nOn the 45 acres of land, stands this spacious Katameya Creeks New Cairo project that is filled to the brim with upscale amenities including a clubhouse, underground parking, commercial strip, and a business hub.\nAlso, you will find a mosque, bicycle lanes, a jogging trail, master suites, spacious hallways, roofed terraces, large windows, kitchen balconies, storage space, VRV units, a garbage shoot, gated retail services, a spa, gym, and lush greens.\n	Katameya Creeks 	Cairo	Cairo	11511	111600000	27900000	0	0	f	Primary	Katameya Creeks 	Starlight Developments 	5	6	750	645	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1748109933890-340.png", "/uploads/properties/images-1748109945713-279.png", "/uploads/properties/images-1748109965721-159.png", "/uploads/properties/images-1748109977762-54.png"]	\N	\N	2025-05-24T18:05:33.396Z	1	published	1	\N	\N	Egypt	\N
33	Junior Ground Chalet in Hacienda Blue	Fully Finished\nDelivery Date 2030\n5% down payment - 5% after 3 months \nThe rest over 10 years\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \nSimply put, if you are looking for vacations out of this world, Hacienda Blue Ras El Hekma is the right place for you. \n\nPalm Hills Developments is establishing Hacienda Blue North Coast Resort over 118.5 acres of land in Ras El Hekma. Over this area, the resort is planned to feature a wide range of facilities, entertainment venues, and residential properties. \nIt is also worth noting that the footprint in Hacienda Blue is only 13%, while landscapes and open spaces have the lion’s share with around 60% of the project’s area dedicated to them. \n	Hacienda Blue	North coast	North coast	23511	21722000	1086100	0	0	f	Primary	Hacienda Blue	Palm Hills	3	1	116	0	186	0	f	chalet	f	t	f	\N	\N	{}	["/uploads/properties/images-1748115769885-432.jpeg", "/uploads/properties/images-1748115771077-410.jpeg"]	\N	\N	2025-05-24T19:42:49.391Z	1	published	1	\N	\N	Egypt	\N
34	Junior Chalet First in Hacienda Blue	Fully Finished\nPenthouse 36.5m\nRoof Area 56.5m\nMaid’s room\n\nDelivery Date 2030\n5% down payment - 5% after 3 months \nThe rest over 10 years\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \nSimply put, if you are looking for vacations out of this world, Hacienda Blue Ras El Hekma is the right place for you. \n\nPalm Hills Developments is establishing Hacienda Blue North Coast Resort over 118.5 acres of land in Ras El Hekma. Over this area, the resort is planned to feature a wide range of facilities, entertainment venues, and residential properties. \nIt is also worth noting that the footprint in Hacienda Blue is only 13%, while landscapes and open spaces have the lion’s share with around 60% of the project’s area dedicated to them. 	Hacienda Blue 	North coast	North coast	23511	20036000	1001800	0	0	f	Primary	Hacienda Blue 	Palm Hills	2	2	115	0	0	0	f	chalet	f	t	f	\N	\N	{}	["/uploads/properties/images-1748116075258-497.jpeg", "/uploads/properties/images-1748116076111-830.jpeg"]	\N	\N	2025-05-24T19:47:54.741Z	1	published	1	\N	\N	Egypt	\N
35	Senior Ground Chalet in Hacienda Blue	Fully Finished\n3 bedrooms + Maid’s room\n\nDelivery Date 2030\n5% down payment - 5% after 3 months \nThe rest over 10 years\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \nSimply put, if you are looking for vacations out of this world, Hacienda Blue Ras El Hekma is the right place for you. \n\nPalm Hills Developments is establishing Hacienda Blue North Coast Resort over 118.5 acres of land in Ras El Hekma. Over this area, the resort is planned to feature a wide range of facilities, entertainment venues, and residential properties. \nIt is also worth noting that the footprint in Hacienda Blue is only 13%, while landscapes and open spaces have the lion’s share with around 60% of the project’s area dedicated to them. 	Hacienda Blue	North coast	North coast	23511	25969000	1298450	0	0	f	Primary	Hacienda Blue	Palm Hills	3	2	164	0	210	0	f	chalet	f	t	f	\N	\N	{}	["/uploads/properties/images-1748116466542-693.jpeg", "/uploads/properties/images-1748116467709-520.jpeg", "/uploads/properties/images-1748116469516-585.jpeg"]	\N	\N	2025-05-24T19:54:25.488Z	1	published	1	\N	\N	Egypt	\N
36	Senior Chalet First in Hacienda Blue	Fully Finished\n3 bedrooms + Maid’s room\nPenthouse 41m\nRoof Area 96m\n\nDelivery Date 2030\n5% down payment - 5% after 3 months \nThe rest over 10 years\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \nSimply put, if you are looking for vacations out of this world, Hacienda Blue Ras El Hekma is the right place for you. \n\nPalm Hills Developments is establishing Hacienda Blue North Coast Resort over 118.5 acres of land in Ras El Hekma. Over this area, the resort is planned to feature a wide range of facilities, entertainment venues, and residential properties. \nIt is also worth noting that the footprint in Hacienda Blue is only 13%, while landscapes and open spaces have the lion’s share with around 60% of the project’s area dedicated to them. 	Hacienda Blue	North coast	North coast	23511	23850000	1192500	0	0	f	Primary	Hacienda Blue	Palm Hills	3	2	154	0	0	0	f	chalet	f	t	f	\N	\N	{}	["/uploads/properties/images-1748116900084-303.jpeg", "/uploads/properties/images-1748116901571-953.jpeg"]	\N	\N	2025-05-24T20:01:39.531Z	1	published	1	\N	\N	Egypt	\N
37	Middle Town house in Hacienda Blue	Fully Finished\nDelivery Date 2030\n\nPenthouse 38m\nRoof Area 45m\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \nSimply put, if you are looking for vacations out of this world, Hacienda Blue Ras El Hekma is the right place for you. \n\nPalm Hills Developments is establishing Hacienda Blue North Coast Resort over 118.5 acres of land in Ras El Hekma. Over this area, the resort is planned to feature a wide range of facilities, entertainment venues, and residential properties. \nIt is also worth noting that the footprint in Hacienda Blue is only 13%, while landscapes and open spaces have the lion’s share with around 60% of the project’s area dedicated to them. \n	Hacienda blue	North coast	North coast	23511	30261000	1513050	0	0	f	Primary	Hacienda blue	Palm Hills	3	3	196	187	0	0	f	townhouse	f	t	f	\N	\N	{}	["/uploads/properties/images-1748187973792-541.jpeg", "/uploads/properties/images-1748187975243-412.jpeg"]	\N	\N	2025-05-25T15:46:13.158Z	1	published	1	\N	\N	Egypt	\N
38	Water Villa in Hacienda Blue	Fully Finished\nDelivery Date 2030\n\nPenthouse 46m\nRoof Area 78m\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \nSimply put, if you are looking for vacations out of this world, Hacienda Blue Ras El Hekma is the right place for you. \n\nPalm Hills Developments is establishing Hacienda Blue North Coast Resort over 118.5 acres of land in Ras El Hekma. Over this area, the resort is planned to feature a wide range of facilities, entertainment venues, and residential properties. \nIt is also worth noting that the footprint in Hacienda Blue is only 13%, while landscapes and open spaces have the lion’s share with around 60% of the project’s area dedicated to them. 	Hacienda Blue	North coast	North coast	23511	59831000	2991550	0	0	f	Primary	Hacienda Blue	Palm Hills	3	3	278	420	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1748188418015-804.jpeg", "/uploads/properties/images-1748188420027-118.jpeg", "/uploads/properties/images-1748188420028-14.jpeg"]	\N	\N	2025-05-25T15:53:37.409Z	1	published	1	\N	\N	Egypt	\N
39	Luxurious Villa in Hacienda Blue	Second Row\nSea view\nFully Finished\nDelivery Date 2030\n\nPenthouse 46m\nRoof Area 78m\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \nSimply put, if you are looking for vacations out of this world, Hacienda Blue Ras El Hekma is the right place for you. \n\nPalm Hills Developments is establishing Hacienda Blue North Coast Resort over 118.5 acres of land in Ras El Hekma. Over this area, the resort is planned to feature a wide range of facilities, entertainment venues, and residential properties. \nIt is also worth noting that the footprint in Hacienda Blue is only 13%, while landscapes and open spaces have the lion’s share with around 60% of the project’s area dedicated to them. 	Hacienda Blue	North coast	North coast	23511	73565000	3678250	0	0	f	Primary	Hacienda Blue	Palm Hills	3	3	278	420	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1748188848844-161.jpeg", "/uploads/properties/images-1748188849378-486.jpeg", "/uploads/properties/images-1748188850830-520.jpeg"]	\N	\N	2025-05-25T16:00:47.548Z	1	published	1	\N	\N	Egypt	\N
46	Ground chalet for sale in Silver Sands	Remaining installments: 11,582,000 till 2030\nMaid’s room + toilet \n\nSilver Town is one of the magnificent phases inside Silversands Resort by Ora Developers in Sidi Heneish, North Coast.\nSilver Town is a fully-fledged bustling commercial island designed as a town where energy is vibrant and where all can find a place to vibe and enjoy. \nThanks to its central location inside Silversands, its top-tier facilities, and its top-notch services, Silver Town Ora is the ultimate destination for relaxation and immersing in luxury.\n	Silversands 	North coast	North coast	23511	22582200	11725986	0	0	f	Resale	Silversands 	Ora Developers 	4	3	204	0	120	0	f	chalet	f	t	f	\N	\N	{}	["uploads/properties/images-1748262862002-178.png"]	\N	\N	2025-05-26T12:33:58.844Z	1	published	1	\N	\N	Egypt	\N
51	Penthouse in Bay west valley - Soma Bay	Fully Finished\n10% Down payment and the rest over 7years\nDelivery Date: 2028\n\nBay West Soma Bay is a natural sanctuary overlooking the Red Sea coastline. It is a flawless vacation destination with a broad array of amenities, aimed at offering tranquility seekers a hassle-free experience.\nIn BayWest Valley in Soma Bay, one can unwind, relax, and enjoy unparalleled fun. The neighborhood is in proximity to Somabay’s boundless popular destinations, from 7BFT Kitehouse to Orca Dive Center. \n\nThe Bay West Valley location was smartly picked to be between the west coast of Soma and the beautiful mountains of the Red Sea. It is close to Mesca Somabay, one of the fanciest neighborhoods in the area. 	Bay West	Red Sea	Red Sea	84712	15440000	1544000	0	0	f	Primary	Bay West	Abu Soma Development 	3	2	171	0	0	0	f	penthouse	f	t	f	\N	\N	{}	["uploads/properties/images-1748371071613-724.jpeg", "uploads/properties/images-1748371071614-255.jpeg", "uploads/properties/images-1748371071616-485.png", "uploads/properties/images-1748371071619-518.png"]	\N	\N	2025-05-27T18:36:58.681Z	1	published	1	\N	\N	Egypt	\N
40	First Row Villa in Hacienda Waters	Fully Finished\n5% down payment, 5% Contract\nThe rest over 10 years\nDelivery Date 2029\n\nPalm Hills Developments is back again with a new project in the North Coast - introducing Hacienda Blue. Like its predecessors (Hacienda Bay, Hacienda White, Hacienda Waters, and Hacienda West), the resort is already gaining tremendous momentum thanks to the developer’s reputation, prime location in Ras El Hekma, world-class amenities, and unique expereinces. \n\nHacienda Waters by Palm Hills Developments is one of the fanciest resorts in the North Coast. Palm Hills developed Hacienda Waters over 161 acres area in Ras El Hekma. It included many premium amenities in the project, varying between leisure activities, tranquil spots, and exclusive services.\n\nHacienda Waters Ras El Hekma is a flawless family gateway from the hassle of the city to the reviving Mediterranean Sea’s breeze. Palm Hills developed a wide range of family-oriented activities in the resort so that every member will create unforgettable memories.\n	Hacienda Waters	North coast	North coast	23511	106617000	5330850	0	0	f	Primary	Hacienda Waters	Palm Hills	4	5	374	549	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1748197619459-374.png", "/uploads/properties/images-1748197619465-256.jpeg", "/uploads/properties/images-1748197619465-757.jpeg"]	\N	\N	2025-05-25T18:26:51.286Z	1	published	1	\N	\N	Egypt	\N
42	Studio in Branded Residences - Silversands	Fully Finished with AC’s & kitchen cabinets \n\n5% down payment  - 5% after 3 months - 5% after 3 months\nRest over 6 years\n\nDelivery Date 2028\n\n\nSilver Sands in Sidi Heneish, North Coast is an artwork by Ora Developers rolling over 506 acres (2,112,600 SQM) of land. The project is created to be a summer resort, an easy-peasy weekend destination, and an all-year-season gateway.\n\nThe project is created to be “ the Egyptian rendition of Grenada’s Silversands with the essence of Caribbean luxury lifestyle living”. This is clearly seen in every element of Silver Sands North Coast including its endless amenities, prime location, and premium properties. \n\n\nSilver Sands North Coast Location\nThe location of Silversands was carefully chosen in Sidi Heneish to complete the symphony of comfort embedded in the project. You can find Silver Sands on the 243rd km of Alexandria - Marsa Matrouh Road (also known as the International Coastal Road).	Silversands	North coast	North coast	23511	18940000	947000	0	0	f	Primary	Silversands	Ora Developers	1	1	78	0	0	0	f	apartment	f	t	f	\N	\N	{}	["uploads/properties/images-1748201757719-773.png", "uploads/properties/images-1748201757734-553.png", "uploads/properties/images-1748201757739-547.png"]	\N	\N	2025-05-25T19:34:57.785Z	1	published	1	\N	\N	Egypt	\N
43	3 bedrooms Duplex in Crystalline - Silversands	5% down payment  - 5% Contract payment\nRest over 8 years\n\nDelivery Date 2028\n\n\nSilver Sands in Sidi Heneish, North Coast is an artwork by Ora Developers rolling over 506 acres (2,112,600 SQM) of land. The project is created to be a summer resort, an easy-peasy weekend destination, and an all-year-season gateway.\n\nThe project is created to be “ the Egyptian rendition of Grenada’s Silversands with the essence of Caribbean luxury lifestyle living”. This is clearly seen in every element of Silver Sands North Coast including its endless amenities, prime location, and premium properties. \n\n\nSilver Sands North Coast Location\nThe location of Silversands was carefully chosen in Sidi Heneish to complete the symphony of comfort embedded in the project. You can find Silver Sands on the 243rd km of Alexandria - Marsa Matrouh Road (also known as the International Coastal Road).	Silversands	North coast	North coast	23511	36500000	1825000	0	0	f	Primary	Silversands	Ora Developers 	3	3	186	0	0	0	f	apartment	f	t	f	\N	\N	{}	["uploads/properties/images-1748203310928-222.png", "uploads/properties/images-1748203310939-317.png", "uploads/properties/images-1748203310944-378.png"]	\N	\N	2025-05-25T20:00:57.974Z	1	published	1	\N	\N	Egypt	\N
44	Duplex in Acclaro - Silversands 	5% down payment  - 5% Contract payment\nRest over 10 years\n\nDelivery Date 2028\n\n\nSilver Sands in Sidi Heneish, North Coast is an artwork by Ora Developers rolling over 506 acres (2,112,600 SQM) of land. The project is created to be a summer resort, an easy-peasy weekend destination, and an all-year-season gateway.\n\nThe project is created to be “ the Egyptian rendition of Grenada’s Silversands with the essence of Caribbean luxury lifestyle living”. This is clearly seen in every element of Silver Sands North Coast including its endless amenities, prime location, and premium properties. \n\n\nSilver Sands North Coast Location\nThe location of Silversands was carefully chosen in Sidi Heneish to complete the symphony of comfort embedded in the project. You can find Silver Sands on the 243rd km of Alexandria - Marsa Matrouh Road (also known as the International Coastal Road).	Silver sands	North coast	North coast	23511	33166000	1658300	0	0	f	Primary	Silver sands	Ora developers 	3	3	163	0	0	0	f	apartment	f	t	f	\N	\N	{}	["uploads/properties/images-1748204049549-242.png", "uploads/properties/images-1748204049555-271.png", "uploads/properties/images-1748204049562-216.png"]	\N	\N	2025-05-25T20:13:22.336Z	1	published	1	\N	\N	Egypt	\N
19	Luxurious villa for sale in Marassi	Marassi Verona\nVilla direct on Lagoon\nPrivate pool\nGround + First floor\n5 master bedrooms\nPremium finishing\nMaid’s room + Driver’s room\n\nPrice: 3Mil USD\n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.\n	Marassi	North coast	North coast	23511	150000000	0	0	0	f	Resale	Marassi	Emaar	5	7	466	700	0	0	f	villa	f	t	f	\N	\N	{}	["/uploads/properties/images-1747938797732-369.jpeg", "/uploads/properties/images-1747938802881-9.jpeg", "/uploads/properties/images-1747938808042-697.jpeg", "/uploads/properties/images-1747938808536-304.jpeg"]	\N	\N	2025-05-22T18:33:17.223Z	1	published	1	\N	\N	Egypt	\N
45	Stand alone villa for sale in Zed East	Ground + First Floor  -    Type B\nFully Finished\nMaid’s room + toilet\nRemaining: 9,592,824\n\nZED East New Cairo Compound is a prestigious project by Ora Developers. It covers 360 acres of land in the heart of New Cairo, one of the most prestigious areas in the East. \nOra delivered the ZED East Compound to offer its clients a sustainable living experience within an elite community in the city. It designed a unique master plan for the project, including a wide range of high-end facilities and luxurious houses. It also implemented various premium services in the ZED 5th Settlement Compound to ensure a comfortable living environment.\nOra placed the Z East Compound in a strategic location in New Cairo, amid many high-end projects, popular destinations, and major roads.\n	Zed East	Cairo	Cairo	11511	46000000	36407176	0	0	f	Resale	Zed East	Ora Developers 	4	4	286	482	0	0	f	villa	f	t	f	\N	\N	{}	["uploads/properties/images-1748261460167-170.png", "uploads/properties/images-1748261460174-453.png", "uploads/properties/images-1748261460178-510.png"]	\N	\N	2025-05-26T12:10:24.137Z	1	published	1	\N	\N	Egypt	\N
48	Fully Finished Villa in Katameya Coast	Villa second row\n5Master bedrooms\nMaid’s room + toilet\n\nStarlight Developments built Katameya Coast Resort over 205 acres in Ras El Hekma, North Coast. It is a flawless vacation destination with luxurious beach houses with uninterrupted sea views, high-end amenities, and boundless leisure activities. \n\n\nKatameya Coast North Coast is ideally located on the 180th km of Alexandria - Marsa Matrouh Road, in proximity to other luxurious projects in Ras El Hekma. Upon reaching the resort, vacationers get to unlock a beautiful coastal escapade where they can revive their minds and body, create unforgettable memories, and indulge in unlimited fun. \n\nThe Katameya Coast North Coast Project was designed over 7 levels of cascading platforms, granting its residents an uninterrupted view of the Mediterranean Sea. It features a 765m beachfront with a variety of activities, where a dip in the azure waters would refresh your mind and body. \n	Katameya Coast	North coast	North coast	23511	75000000	0	0	0	f	Resale	Katameya Coast	Ora Developers 	5	6	320	780	0	0	f	villa	t	t	t	\N	\N	{}	["attached_assets/IMG_6965.png", "attached_assets/image_1748369721196.png"]	\N	\N	2025-05-26T13:10:28.226Z	1	published	1	\N	\N	Egypt	\N
47	Villa Direct on Lagoon in Marassi	Villa in Marassi - Salerno\nGround, first & Roof \nVery prime location\nLagoon view\nBahary 100%\n3 bedrooms + Guest room + Maid’s room \n\nMarassi North Coast is a 6.5 million sqm coastal paradise by Emaar Misr. It is built to revolutionize your Sahel experience, exhibiting a wide range of luxurious amenities and beach houses.\nEmaar Misr picked the location of Marassi to be on the 126th km of the International Coastal Road. It outlined a master plan for the Marassi Project with various premium facilities and elite properties. \nEmaar Misr merged the exclusive facilities of Marassi North Coast with the prime services it implemented in the resort, offering you a flawless gateway from the hassle of the city into a tranquil haven. \nEmaar Misr promises an unparalleled indulgence in luxury, comfort, convenience, and leisure in Marassi Egypt Village.\n	Marassi	North coast	North coast	23511	75000000	0	0	0	f	Resale	Marassi	Emaar	4	3	321	470	0	0	f	villa	t	t	t	\N	\N	{}	["attached_assets/IMG_6955.png", "attached_assets/IMG_6964.png"]	\N	\N	2025-05-26T12:46:14.564Z	1	published	1	\N	\N	Egypt	\N
49	1 Bedroom in Bay west valley - Soma Bay	Fully Finished\n10% Down payment and the rest over 7years\nDelivery Date: 2028\n\nBay West Soma Bay is a natural sanctuary overlooking the Red Sea coastline. It is a flawless vacation destination with a broad array of amenities, aimed at offering tranquility seekers a hassle-free experience.\nIn BayWest Valley in Soma Bay, one can unwind, relax, and enjoy unparalleled fun. The neighborhood is in proximity to Somabay’s boundless popular destinations, from 7BFT Kitehouse to Orca Dive Center. \n\nThe Bay West Valley location was smartly picked to be between the west coast of Soma and the beautiful mountains of the Red Sea. It is close to Mesca Somabay, one of the fanciest neighborhoods in the area. \n\n	Bay West	Red Sea	Red Sea	84712	8350000	835000	0	0	f	Primary	Bay West	Abu Soma Development	1	1	82	0	0	0	f	apartment	f	t	f	\N	\N	{}	["uploads/properties/images-1748370398735-524.jpeg", "uploads/properties/images-1748370398737-72.jpeg", "uploads/properties/images-1748370398738-760.png", "uploads/properties/images-1748370398741-109.png"]	\N	\N	2025-05-27T18:25:53.055Z	1	published	1	\N	\N	Egypt	\N
53	Villa 3 Bedrooms in Bay west valley - Soma Bay	Fully Finished\nDelivery Date 2028\n10% Down payment and the rest over 7 years\n\nBay West Soma Bay is a natural sanctuary overlooking the Red Sea coastline. It is a flawless vacation destination with a broad array of amenities, aimed at offering tranquility seekers a hassle-free experience.\nIn BayWest Valley in Soma Bay, one can unwind, relax, and enjoy unparalleled fun. The neighborhood is in proximity to Somabay’s boundless popular destinations, from 7BFT Kitehouse to Orca Dive Center. \n\nThe Bay West Valley location was smartly picked to be between the west coast of Soma and the beautiful mountains of the Red Sea. It is close to Mesca Somabay, one of the fanciest neighborhoods in the area. 	Bay West	Red Sea	Red Sea	84712	20100000	2010000	0	0	f	Primary	Bay West	Abu Soma Development 	3	2	158	400	0	0	f	villa	f	t	f	\N	\N	{}	["uploads/properties/images-1748375461651-214.jpeg", "uploads/properties/images-1748375461655-226.png", "uploads/properties/images-1748375461658-34.png", "uploads/properties/images-1748375461661-158.png"]	\N	\N	2025-05-27T19:50:20.888Z	1	published	1	\N	\N	Egypt	\N
50	2 Bedrooms Apartment in Bay west valley - Soma Bay	Fully Finished\n10% Down payment and the rest over 7years\nDelivery Date: 2028\n\nBay West Soma Bay is a natural sanctuary overlooking the Red Sea coastline. It is a flawless vacation destination with a broad array of amenities, aimed at offering tranquility seekers a hassle-free experience.\nIn BayWest Valley in Soma Bay, one can unwind, relax, and enjoy unparalleled fun. The neighborhood is in proximity to Somabay’s boundless popular destinations, from 7BFT Kitehouse to Orca Dive Center. \n\nThe Bay West Valley location was smartly picked to be between the west coast of Soma and the beautiful mountains of the Red Sea. It is close to Mesca Somabay, one of the fanciest neighborhoods in the area. 	Bay West	Red Sea	Red Sea	84712	9810000	981000	0	0	f	Primary	Bay West	Abu Soma Development	2	2	112	0	0	0	f	apartment	f	t	f	\N	\N	{}	["uploads/properties/images-1748370697554-5.jpeg", "uploads/properties/images-1748370697555-415.jpeg", "uploads/properties/images-1748370697556-943.png", "uploads/properties/images-1748370697560-401.png"]	\N	\N	2025-05-27T18:30:47.467Z	1	published	1	\N	\N	Egypt	\N
54	Villa 2 Bedrooms in Bay west valley - Soma Bay	Fully Finished\nDelivery Date 2028\n10% Down payment and the rest over 7 years\n\nBay West Soma Bay is a natural sanctuary overlooking the Red Sea coastline. It is a flawless vacation destination with a broad array of amenities, aimed at offering tranquility seekers a hassle-free experience.\nIn BayWest Valley in Soma Bay, one can unwind, relax, and enjoy unparalleled fun. The neighborhood is in proximity to Somabay’s boundless popular destinations, from 7BFT Kitehouse to Orca Dive Center. \n\nThe Bay West Valley location was smartly picked to be between the west coast of Soma and the beautiful mountains of the Red Sea. It is close to Mesca Somabay, one of the fanciest neighborhoods in the area. 	Bay West	Red Sea	Red Sea	84712	18780000	1878000	0	0	f	Primary	Bay West	Abu Soma Development 	2	2	122	0	0	0	f	villa	f	t	f	\N	\N	{}	["uploads/properties/images-1748375917958-709.png", "uploads/properties/images-1748375917962-244.png", "uploads/properties/images-1748375917972-670.png", "uploads/properties/images-1748375917981-761.png"]	\N	\N	2025-05-27T19:57:56.403Z	1	published	1	\N	\N	Egypt	\N
52	Villa 4 Bedrooms in Bay west valley- Soma Bay	Ground + First\nFully Finished\nDelivery Date 2028\n10% Down payment and the rest over 7 years\n\nBay West Soma Bay is a natural sanctuary overlooking the Red Sea coastline. It is a flawless vacation destination with a broad array of amenities, aimed at offering tranquility seekers a hassle-free experience.\nIn BayWest Valley in Soma Bay, one can unwind, relax, and enjoy unparalleled fun. The neighborhood is in proximity to Somabay’s boundless popular destinations, from 7BFT Kitehouse to Orca Dive Center. \n\nThe Bay West Valley location was smartly picked to be between the west coast of Soma and the beautiful mountains of the Red Sea. It is close to Mesca Somabay, one of the fanciest neighborhoods in the area. \n\n\n	Bay West	Red Sea	Red Sea	84712	22410000	2241000	0	0	f	Primary	Bay West	Abu Soma Development 	4	3	187	400	0	0	f	villa	f	t	f	\N	\N	{}	["uploads/properties/images-1748375069664-352.jpeg", "uploads/properties/images-1748375069667-23.png", "uploads/properties/images-1748375069670-491.png", "uploads/properties/images-1748375069673-388.jpeg"]	\N	\N	2025-05-27T19:44:02.207Z	1	published	1	\N	\N	Egypt	\N
41	2 Bedrooms Apartment in Branded Residences - Silversands	Fully Finished with AC’s & kitchen cabinets \n\n5% down payment  - 5% after 3 months - 5% after 3 months\nRest over 6 years\n\nDelivery Date 2028\n\n\nSilver Sands in Sidi Heneish, North Coast is an artwork by Ora Developers rolling over 506 acres (2,112,600 SQM) of land. The project is created to be a summer resort, an easy-peasy weekend destination, and an all-year-season gateway.\n\nThe project is created to be “ the Egyptian rendition of Grenada’s Silversands with the essence of Caribbean luxury lifestyle living”. This is clearly seen in every element of Silver Sands North Coast including its endless amenities, prime location, and premium properties. \n\n\nSilver Sands North Coast Location\nThe location of Silversands was carefully chosen in Sidi Heneish to complete the symphony of comfort embedded in the project. You can find Silver Sands on the 243rd km of Alexandria - Marsa Matrouh Road (also known as the International Coastal Road).\n	Silversands	North coast	North coast	23511	32249000	1612450	0	0	f	Primary	Silversands	Ora Developers	2	3	158	0	0	0	f	apartment	f	t	f	\N	\N	{}	["uploads/properties/images-1748199988738-723.png", "uploads/properties/images-1748199988749-108.png", "uploads/properties/images-1748199988755-649.png"]	\N	\N	2025-05-25T19:05:22.827Z	1	published	1	\N	\N	Egypt	\N
55	Studio in Sky Rise - Dubai	Prime Location in Business Bay\nUnit Area: 449 Sq.ft\nBalcony: 115 Sq.ft\n\nAsking price: 1,312,499 AED\n20% Down payment \n50% During Construction (quarterly)\n30% Handover\n\nCompletion Date: Q4 / 2026\n\nBinghatti Skyrise is a hugely anticipated landmark new development located in the dynamic Business Bay district of Dubai. Comprising three stunning towers, this AED 5 billion multi-building complex offers 3,333 luxurious residential units, including a selection of studios, one, two, and three-bedroom apartments. Each residence has been meticulously crafted with open layouts, high-end finishes, and large windows that maximize light and take full advantage of the glorious views on offer.\n\nThe three towers feature a sleek, fluid design that adds a regal touch to Dubai’s ever-evolving skyline. Crowned by a diamond-shaped pinnacle once complete this will undoubtably be one of the most iconic and beautiful developments in the area. Strategically positioned in the heart of Business Bay, residents of Binghatti Skyrise enjoy a blend of urban sophistication, convenience and serene canal-facing views.\n\nIn true Binghatti fashion this development also features an extensive range of hotel-style amenities, all spread across a vast podium, offering residents a variety of leisure and recreational options at their dorstep.A truly one of a kind project Binghatti Skyrise combines luxury with functionality, providing an exceptional living experience in one of Dubai’s most sought-after locations.\n	Sky Rise	Dubai	Dubai	00000	1312499	262499	0	0	f	Primary	Sky Rise	Binghatti	1	1	449	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748429692457-831.png", "/uploads/properties/images-1748429692463-847.png", "/uploads/properties/images-1748429692468-74.png", "/uploads/properties/images-1748429692471-17.png"]	\N	\N	2025-05-28T10:54:04.965Z	1	published	1	\N	\N	UAE	\N
56	1 Bedroom Apartment in Sky Rise - Dubai	Prime Location in Business Bay\nUnit Area: 603 Sq.ft\nBalcony: 159 Sq.ft\n\nAsking price: 2,062,499 AED\n20% Down payment \n50% During Construction (quarterly)\n30% Handover\n\nCompletion Date: Q4 / 2026\n\nBinghatti Skyrise is a hugely anticipated landmark new development located in the dynamic Business Bay district of Dubai. Comprising three stunning towers, this AED 5 billion multi-building complex offers 3,333 luxurious residential units, including a selection of studios, one, two, and three-bedroom apartments. Each residence has been meticulously crafted with open layouts, high-end finishes, and large windows that maximize light and take full advantage of the glorious views on offer.\n\nThe three towers feature a sleek, fluid design that adds a regal touch to Dubai’s ever-evolving skyline. Crowned by a diamond-shaped pinnacle once complete this will undoubtably be one of the most iconic and beautiful developments in the area. Strategically positioned in the heart of Business Bay, residents of Binghatti Skyrise enjoy a blend of urban sophistication, convenience and serene canal-facing views.\n\nIn true Binghatti fashion this development also features an extensive range of hotel-style amenities, all spread across a vast podium, offering residents a variety of leisure and recreational options at their dorstep.A truly one of a kind project Binghatti Skyrise combines luxury with functionality, providing an exceptional living experience in one of Dubai’s most sought-after locations.	Sky Rise	Dubai	Dubai	00000	2062499	412499	0	0	f	Primary	Sky Rise	Binghatti	1	1	603	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748430042205-577.png", "/uploads/properties/images-1748430042211-318.png", "/uploads/properties/images-1748430042213-290.png", "/uploads/properties/images-1748430042218-46.png"]	\N	\N	2025-05-28T10:59:52.479Z	1	published	1	\N	\N	UAE	\N
57	1 Bedroom Apartment in One - Dubai	Prime Location in Business Bay\nUnit Area: 618 Sq.ft\nTerrace Area: 211 Sq.ft\n\nAsking Price: 2,761,306 AED\nDown payment: 552,261 AED\n\n20% Down Payment\n50% During Construction (Quarterly)\n30% Handover\n\nCompletion Date:  Q4 / 2026\n\nThe conceptual design is characterized by the interplay of architectural systems, each contributing to a grander narrative of unity and balance. \n\nThe façade manifests a visual symphony of materials and forms, amalgamating non-conventional and contemporary elements.\n\nThe locale is marked by glamour and exuberance brought by the eminent metropolitan enclaves surrounding Dubai’s Business Bay district. \n\nThrough its convenient access to Downtown Dubai\nand Dubai International Financial Centre, this cosmopolitan hub emerges as an epicentre for culture and commerce. \n\nAgainst the backdrop of the glistening Dubai Water Canal, the waterfront development epitomizes sophistication, embodying a vision of modernity and opulence.\n	One	Dubai	Dubai	00000	2761306	552261	0	0	f	Primary	One	Binghatti	1	1	618	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748432643436-641.png", "/uploads/properties/images-1748432643446-758.png", "/uploads/properties/images-1748432643451-404.png"]	\N	\N	2025-05-28T11:43:12.629Z	1	published	1	\N	\N	UAE	\N
58	1 Bedroom Royal Suite in One - Dubai	Prime Location in Business Bay\nUnit Area: 646 Sq.ft\nTerrace Area: 384 Sq.ft\n\nAsking Price: 2,874,999 AED\nDown payment: 574,999 AED\n\n20% Down Payment\n50% During Construction (Quarterly)\n30% Handover\n\nCompletion Date:  Q4 / 2026\n\nThe conceptual design is characterized by the interplay of architectural systems, each contributing to a grander narrative of unity and balance. \n\nThe façade manifests a visual symphony of materials and forms, amalgamating non-conventional and contemporary elements.\n\nThe locale is marked by glamour and exuberance brought by the eminent metropolitan enclaves surrounding Dubai’s Business Bay district. \n\nThrough its convenient access to Downtown Dubai\nand Dubai International Financial Centre, this cosmopolitan hub emerges as an epicentre for culture and commerce. \n\nAgainst the backdrop of the glistening Dubai Water Canal, the waterfront development epitomizes sophistication, embodying a vision of modernity and opulence.	One	Dubai	Dubai	00000	2874999	574999	0	0	f	Primary	One	Binghatti	1	1	646	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748432979849-894.png", "/uploads/properties/images-1748432979851-329.png", "/uploads/properties/images-1748432979858-196.png"]	\N	\N	2025-05-28T11:49:12.911Z	1	published	1	\N	\N	UAE	\N
59	2 Bedroom Suite in One - Dubai	Prime Location in Business Bay\nUnit Area: 872 Sq.ft\nTerrace Area: 714 Sq.ft\n\nAsking Price: 4,499,999 AED\nDown payment: 899,999 AED\n\n20% Down Payment\n50% During Construction (Quarterly)\n30% Handover\n\nCompletion Date:  Q4 / 2026\n\nThe conceptual design is characterized by the interplay of architectural systems, each contributing to a grander narrative of unity and balance. \n\nThe façade manifests a visual symphony of materials and forms, amalgamating non-conventional and contemporary elements.\n\nThe locale is marked by glamour and exuberance brought by the eminent metropolitan enclaves surrounding Dubai’s Business Bay district. \n\nThrough its convenient access to Downtown Dubai\nand Dubai International Financial Centre, this cosmopolitan hub emerges as an epicentre for culture and commerce. \n\nAgainst the backdrop of the glistening Dubai Water Canal, the waterfront development epitomizes sophistication, embodying a vision of modernity and opulence.	One	Dubai	Dubai	00000	4499999	899999	0	0	f	Primary	One	Binghatti	2	2	872	0	0	0	f	apartment	f	t	f	\N	\N	{}	["/uploads/properties/images-1748433269299-225.png", "/uploads/properties/images-1748433269304-401.png", "/uploads/properties/images-1748433269308-501.png"]	\N	\N	2025-05-28T11:54:00.926Z	1	published	1	\N	\N	UAE	\N
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
pNuHQ4ywSy0tXZcGIP4PQrxq-3_pdpYJ	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-13T03:34:46.573Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-13 03:34:47
AhPiwXeInSvSCqWUjEF50pPf7xygismc	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-05-23T20:57:55.912Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-05-23 20:58:58
2GO_z3ZTu1qERWLW48mBcuWBQiEhs0DJ	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-09T17:57:59.643Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-09 17:58:00
wAw1hCyk6GHqN7dpRyuJ4m9gkWx95fRJ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-07T11:22:50.423Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-07 16:12:48
EZkHlNwkcA6GuoHOSrD17xAPTP_gRbvy	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-12T09:08:05.160Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-12 09:08:06
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
h2yvX7s2wYDnWaa0qu0-ILxIItR2xpie	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-12T11:54:39.570Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-12 11:54:40
X6sFmJSFEnGz7awtrFSnAU1tXCCzK3bc	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-06T20:15:20.205Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-06 20:15:21
B4jPn_R8KT27PPIgmCxhHJx2cjKMBghz	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-04T11:14:52.496Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-04 11:14:53
kxK5cReaeLNwrgrXj7rGE-4Wa6KA86T7	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-09T14:17:12.890Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-09 14:17:13
TnSxEF8M9HHiol1S2Fsl2rVLmU-fp4Mh	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-10T12:59:19.606Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-10 12:59:20
diYkznK7QazwgUg42Ws3UFxqSA8-5S31	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-10T11:53:11.421Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-10 11:53:12
LJVqzlsFrvsYCPbRYd3P1bZ9nZBrgpXy	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-09T08:04:34.776Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-09 08:04:35
TJVg3vG0-5JQR3FIUiSwxYovbmW0IUpe	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-06-29T16:40:00.464Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-29 16:40:01
gAGSydMfZILLLRgjUnwOUEd-ey3EvkzU	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-06-11T12:48:18.272Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-06-11 13:51:28
bil6eoA8NCISvoNmVfOWxy4TGpbmdIC0	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-09T17:56:18.087Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-09 17:56:19
fmHZT_l5wc8DFSd67djiaZCXJrY-apaq	{"cookie":{"originalMaxAge":3888000000,"expires":"2025-07-13T03:52:54.598Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"passport":{"user":1}}	2025-07-13 03:52:55
\.


--
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, client_name, client_location, rating, testimonial, initials, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, username, password, email, full_name, phone, is_agent, created_at, role, created_by, is_active, password_hash, first_name, last_name) FROM stdin;
1	owner	4932f571cf3076c24ac80cf8e1c4a746834085bd4d3764010a953a1f73bade3df7d9277a92dd4517b4759c34072ef76e518a79c407c2fc2769f9c7a9e8e21ccc.ffd72541ab593b99d0ab12982a33a617	owner@theviews.com	System Owner	\N	t	2025-04-04T05:33:01.546Z	owner	\N	t	\N	\N	\N
2	Dina	6db0d437fe53359aafbf1b8f9abea096cb93ba0a9a3e68f2e061d025b0d418c2a3c0f9a0b055488a6968b8dbb0a8e6aab3e0ab60150d23c08d268b0e6649fe0b.405a94cd5000bccaf5592d15efc38709	assem@theviewsconsultancy.com	Dina Mohamed 		f	2025-04-04T13:44:32.994Z	admin	1	t	\N	\N	\N
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.articles_id_seq', 3, true);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leads_id_seq', 1, false);


--
-- Name: newsletters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletters_id_seq', 1, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 5, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.properties_id_seq', 59, true);


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
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: articles articles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: newsletters newsletters_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_email_key UNIQUE (email);


--
-- Name: newsletters newsletters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletters
    ADD CONSTRAINT newsletters_pkey PRIMARY KEY (id);


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

