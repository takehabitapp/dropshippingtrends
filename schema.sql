-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  keyword TEXT NOT NULL,
  score NUMERIC NOT NULL,
  trend NUMERIC NOT NULL,
  growth NUMERIC NOT NULL,
  saturation NUMERIC NOT NULL,
  margin NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate', -- 'candidate', 'top', 'analyzed', 'saved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis table
CREATE TABLE analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  competition_summary TEXT NOT NULL,
  price_estimate NUMERIC NOT NULL,
  supplier_estimate NUMERIC NOT NULL,
  reasoning TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creatives table
CREATE TABLE creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'done',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
