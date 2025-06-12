
-- Create page_seo table for storing page-specific SEO data
CREATE TABLE IF NOT EXISTS page_seo (
    id SERIAL PRIMARY KEY,
    page_name VARCHAR(100) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT,
    structured_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create seo_optimization_log table for tracking optimization runs
CREATE TABLE IF NOT EXISTS seo_optimization_log (
    id SERIAL PRIMARY KEY,
    optimization_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    keywords_updated JSONB,
    pages_optimized INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_page_seo_page_name ON page_seo(page_name);
CREATE INDEX IF NOT EXISTS idx_seo_log_date ON seo_optimization_log(optimization_date);

-- Insert initial SEO data
INSERT INTO page_seo (page_name, title, description, keywords) VALUES
('home', 'شقق للبيع في القاهرة الجديدة | Dubai Marina Luxury Apartments | Hassan Allam Properties | Mohamed Assem', 'شقق للبيع في القاهرة الجديدة, فيلات كمبوند للبيع, Dubai Marina luxury apartments for sale, Hassan Allam Swan Lake Resort properties, Binghatti Stars Business Bay. Expert real estate consultant Egypt Dubai with 30+ years experience.', 'شقق للبيع في القاهرة الجديدة,فيلات كمبوند للبيع,Dubai Marina luxury apartments,Hassan Allam Properties,Binghatti Stars Business Bay')
ON CONFLICT (page_name) DO NOTHING;
