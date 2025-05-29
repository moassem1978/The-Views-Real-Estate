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
4	\N	2025-05-28 20:09:35.97059	\N	Marassi North Coast	Marassi North Coast by EMAAR Misr is Egypt's premier luxury Mediterranean resort destination spanning 1,544 acres along the pristine North Coast. This flagship development features 6.5 kilometers of private beaches, an 18-hole championship golf course, luxury marina, and diverse residential options from beachfront villas to marina apartments. The master-planned community combines stunning natural beauty with world-class amenities, premium retail districts, and sophisticated dining venues, setting the gold standard for luxury coastal living in Egypt.	North Coast, Egypt - 125km west of Alexandria	EMAAR Misr is the Egyptian subsidiary of EMAAR Properties, the world-renowned developer behind iconic projects such as Burj Khalifa and The Dubai Mall. With over 25 years of global experience, EMAAR brings world-class expertise to the Egyptian market. EMAAR Misr is committed to developing landmark destinations that redefine luxury living standards in Egypt, combining international expertise with local market understanding to create exceptional communities that enhance Egypt's real estate landscape.	published	\N	[{"area": "300-800 sqm built-up area", "type": "Beachfront Villas", "bedrooms": "3-6 bedrooms", "features": ["Direct beach access", "Private swimming pool", "Landscaped garden", "Unobstructed sea views", "Premium finishing packages", "Smart home systems"], "bathrooms": "3-7 bathrooms"}, {"area": "250-600 sqm built-up area", "type": "Golf Course Villas", "bedrooms": "3-5 bedrooms", "features": ["Golf course frontage", "Private garden terraces", "Golf club membership included", "Landscaped surroundings", "Modern architectural design", "Premium amenities access"], "bathrooms": "3-6 bathrooms"}, {"area": "120-300 sqm built-up area", "type": "Marina Apartments", "bedrooms": "1-4 bedrooms", "features": ["Marina and yacht views", "Spacious balconies", "Contemporary design", "Resort-style amenities", "24/7 concierge services", "Beach club access"], "bathrooms": "1-4 bathrooms"}, {"area": "400-1000 sqm built-up area", "type": "Hilltop Estates", "bedrooms": "4-7 bedrooms", "features": ["Panoramic Mediterranean views", "Private elevator access", "Infinity swimming pools", "Expansive landscaped grounds", "Ultimate privacy and exclusivity", "Helicopter landing pad access"], "bathrooms": "4-8 bathrooms"}]	["https://www.emaarmisr.com/content/dam/emaar-misr/marassi/gallery/aerial-view.jpg", "https://www.emaarmisr.com/content/dam/emaar-misr/marassi/gallery/beach-club.jpg", "https://ww