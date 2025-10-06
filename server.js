// server.js - Backend API for Cost of Living Calculator
// Install dependencies first: npm install express cors axios cheerio
// Then run: node server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper function to clean and parse prices
function parsePrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/[,$]/g, '').trim();
  const match = cleaned.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// Scrape Numbeo data with better error handling
async function scrapeNumbeo(city) {
  try {
    // Format city name for URL - Numbeo uses specific formats
    let cityFormatted = city.trim();
    
    // Remove state/country codes for major cities (Numbeo doesn't use them)
    // "Los Angeles, CA" -> "Los Angeles"
    // "Mountain View, CA" -> "Mountain View"
    cityFormatted = cityFormatted.replace(/,\s*(CA|NY|TX|FL|IL|WA|MA|CO|OR|AZ|GA|NC|MI|PA|OH|NJ|VA|TN|MD|MN|WI|MO|IN|SC|AL|KY|LA|OK|CT|UT|NV|KS|AR|MS|NM|NE|WV|ID|HI|ME|NH|RI|MT|DE|SD|ND|AK|VT|WY|DC)\b/i, '');
    
    // Create URL-friendly slug
    let citySlug = cityFormatted
      .split(',')[0] // Take only first part before comma
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '');
    
    const url = `https://www.numbeo.com/cost-of-living/in/${citySlug}`;
    
    console.log(`\n🔍 Attempting to scrape: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
      },
      timeout: 15000,
      validateStatus: function (status) {
        return status === 200;
      }
    });

    const $ = cheerio.load(response.data);
    const data = {
      source: 'Numbeo',
      city: city,
      categories: {},
      rawData: [] // Store all found prices for debugging
    };

    console.log('📊 Parsing Numbeo data...');

    // Try multiple table selectors
    const tables = $('table.data_wide_table, table.table_indices, table');
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found on page');
      return null;
    }

    console.log(`Found ${tables.length} tables`);

    // Extract prices from tables
    tables.each((tableIndex, table) => {
      $(table).find('tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim();
          const priceText = $(cells[1]).text().trim();
          const price = parsePrice(priceText);

          if (label && price) {
            data.rawData.push({ label, price });
            
            // Map to our categories with flexible matching
            if (label.match(/apartment.*1.*bedroom.*city.*centre/i) || 
                label.match(/rent.*1.*bed.*center/i)) {
              data.categories.housingCenter = price;
              console.log(`✓ Housing (Center): $${price}`);
            } 
            else if (label.match(/apartment.*1.*bedroom.*outside/i) ||
                     label.match(/rent.*1.*bed.*outside/i)) {
              data.categories.housingOutside = price;
              console.log(`✓ Housing (Outside): $${price}`);
            }
            else if (label.match(/meal.*inexpensive.*restaurant/i) ||
                     label.match(/meal.*cheap.*restaurant/i)) {
              data.categories.mealRestaurant = price;
              console.log(`✓ Meal: $${price}`);
            }
            else if (label.match(/monthly.*pass/i) ||
                     label.match(/public.*transport/i)) {
              data.categories.transportation = price;
              console.log(`✓ Transportation: $${price}`);
            }
            else if (label.match(/basic.*utilities/i) ||
                     label.match(/electricity.*heating.*cooling/i)) {
              data.categories.utilities = price;
              console.log(`✓ Utilities: $${price}`);
            }
          }
        }
      });
    });

    // If we couldn't parse key data, return null
    if (!data.categories.housingCenter && data.rawData.length === 0) {
      console.log('❌ Could not extract any pricing data');
      return null;
    }

    console.log(`✅ Successfully extracted ${Object.keys(data.categories).length} categories`);
    return data;

  } catch (error) {
    if (error.response) {
      console.error(`❌ HTTP Error ${error.response.status}: ${error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ Request timeout - Numbeo took too long to respond');
    } else {
      console.error('❌ Scraping error:', error.message);
    }
    return null;
  }
}

// Search Reddit for cost of living discussions
async function searchReddit(city) {
  try {
    const query = `${city} cost of living`;
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=10&sort=relevance`;
    
    console.log(`\n🔍 Searching Reddit for: "${query}"`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'CostOfLivingResearch/1.0 (Educational Project)'
      },
      timeout: 5000
    });

    if (!response.data || !response.data.data || !response.data.data.children) {
      console.log('⚠️  No Reddit data returned');
      return [];
    }

    const posts = response.data.data.children
      .filter(child => child.data && child.data.title)
      .map(child => ({
        title: child.data.title,
        subreddit: child.data.subreddit,
        url: `https://reddit.com${child.data.permalink}`,
        score: child.data.score,
        comments: child.data.num_comments
      }));

    console.log(`✅ Found ${posts.length} Reddit discussions`);
    return posts;

  } catch (error) {
    console.error('❌ Reddit API error:', error.message);
    return [];
  }
}

// Estimate groceries based on meal costs
function estimateGroceries(mealPrice) {
  if (!mealPrice) return 400; // Default estimate
  // Rough estimate: monthly groceries ≈ 60 meals worth / 3 (groceries cheaper than eating out)
  return Math.round((mealPrice * 60) / 3);
}

// Use fallback data if scraping fails
function getFallbackData(city) {
  const fallbackCities = {
    'new york': { housing: 3500, outside: 2500, meal: 20, transport: 127, utilities: 150 },
    'newyork': { housing: 3500, outside: 2500, meal: 20, transport: 127, utilities: 150 },
    'london': { housing: 2200, outside: 1600, meal: 18, transport: 165, utilities: 200 },
    'tokyo': { housing: 1200, outside: 700, meal: 10, transport: 70, utilities: 150 },
    'paris': { housing: 1400, outside: 1000, meal: 15, transport: 75, utilities: 180 },
    'singapore': { housing: 2800, outside: 2000, meal: 10, transport: 100, utilities: 150 },
    'mountain view': { housing: 3200, outside: 2600, meal: 18, transport: 100, utilities: 120 },
    'mountainview': { housing: 3200, outside: 2600, meal: 18, transport: 100, utilities: 120 },
    'mountain view, ca': { housing: 3200, outside: 2600, meal: 18, transport: 100, utilities: 120 },
    'mountainviewca': { housing: 3200, outside: 2600, meal: 18, transport: 100, utilities: 120 },
    'los angeles': { housing: 2500, outside: 1800, meal: 18, transport: 100, utilities: 140 },
    'losangeles': { housing: 2500, outside: 1800, meal: 18, transport: 100, utilities: 140 },
    'los angeles, ca': { housing: 2500, outside: 1800, meal: 18, transport: 100, utilities: 140 },
    'la': { housing: 2500, outside: 1800, meal: 18, transport: 100, utilities: 140 },
    'san francisco': { housing: 3600, outside: 2800, meal: 20, transport: 98, utilities: 130 },
    'sanfrancisco': { housing: 3600, outside: 2800, meal: 20, transport: 98, utilities: 130 },
    'seattle': { housing: 2300, outside: 1700, meal: 17, transport: 99, utilities: 160 },
    'austin': { housing: 1700, outside: 1300, meal: 15, transport: 75, utilities: 150 },
    'boston': { housing: 2900, outside: 2100, meal: 18, transport: 90, utilities: 170 },
    'chicago': { housing: 1900, outside: 1400, meal: 16, transport: 105, utilities: 140 }
  };

  const cityKey = city.toLowerCase().replace(/\s+/g, '').replace(/,/g, '');
  return fallbackCities[cityKey] || null;
}

// Main endpoint to get cost of living data
app.get('/api/cost-of-living/:city', async (req, res) => {
  try {
    const city = req.params.city;
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🌍 Request for: ${city}`);
    console.log('='.repeat(50));

    // Fetch data from multiple sources in parallel
    const [numbeoData, redditPosts] = await Promise.all([
      scrapeNumbeo(city),
      searchReddit(city)
    ]);

    let finalData;

    if (numbeoData && numbeoData.categories.housingCenter) {
      // Use scraped data
      console.log('\n✅ Using scraped Numbeo data');
      finalData = numbeoData.categories;
    } else {
      // Try fallback data
      console.log('\n⚠️  Scraping failed, checking fallback data...');
      const fallback = getFallbackData(city);
      
      if (!fallback) {
        console.log('❌ No fallback data available for this city');
        
        // Try to give helpful suggestions
        const suggestions = city.toLowerCase().includes('mountain') ? 
          'Try: "Mountain View" without CA' :
          'Try major cities like: New York, Los Angeles, San Francisco, Seattle, Chicago, Boston, Austin, or international cities like London, Tokyo, Paris';
        
        return res.status(404).json({
          error: 'City not found',
          message: `Could not find cost of living data for "${city}". The city might not be in Numbeo's database.`,
          suggestion: suggestions,
          tip: 'For US cities, try without the state code (e.g., "Los Angeles" instead of "Los Angeles, CA")'
        });
      }

      console.log('✅ Using fallback data');
      finalData = {
        housingCenter: fallback.housing,
        housingOutside: fallback.outside,
        mealRestaurant: fallback.meal,
        transportation: fallback.transport,
        utilities: fallback.utilities
      };
    }

    // Calculate estimates
    const groceries = estimateGroceries(finalData.mealRestaurant);
    const entertainment = Math.round((finalData.mealRestaurant || 15) * 10);

    // Compile final response
    const response = {
      city: city,
      currency: 'USD',
      lastUpdated: new Date().toLocaleDateString(),
      categories: {
        housing: {
          label: 'Housing (1-bedroom apt)',
          cityCenter: Math.round(finalData.housingCenter || 1200),
          outside: Math.round(finalData.housingOutside || 800)
        },
        food: {
          label: 'Food & Groceries',
          monthly: groceries
        },
        transportation: {
          label: 'Transportation',
          monthly: Math.round(finalData.transportation || 70)
        },
        utilities: {
          label: 'Utilities',
          monthly: Math.round(finalData.utilities || 150)
        },
        entertainment: {
          label: 'Entertainment',
          monthly: entertainment
        }
      },
      sources: numbeoData ? ['Numbeo.com (live)', 'Reddit discussions'] : ['Estimated data', 'Reddit discussions'],
      redditDiscussions: redditPosts.slice(0, 5)
    };

    console.log('\n✅ Successfully prepared response');
    console.log('='.repeat(50) + '\n');
    
    res.json(response);

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred. Please try again.',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Cost of Living API is running',
    timestamp: new Date().toISOString(),
    version: '2.0'
  });
});

// Root endpoint with documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Cost of Living API',
    version: '2.0',
    endpoints: {
      health: 'GET /health',
      getCityData: 'GET /api/cost-of-living/:city'
    },
    supportedCities: ['New York', 'Los Angeles', 'San Francisco', 'Seattle', 'Austin', 'Boston', 'Chicago', 'Mountain View, CA', 'London', 'Tokyo', 'Paris', 'Singapore', 'and many more'],
    example: '/api/cost-of-living/New York'
  });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('✅ Cost of Living API v2.0 is running!');
  console.log('='.repeat(50));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`💊 Health: http://localhost:${PORT}/health`);
  console.log(`🔍 Example: http://localhost:${PORT}/api/cost-of-living/New%20York`);
  console.log('='.repeat(50) + '\n');
});