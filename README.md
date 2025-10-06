# 💰 Cost of Living Calculator

A full-stack web application that provides real-time cost of living estimates for cities worldwide by aggregating data from Numbeo and Reddit discussions.

![Cost of Living Calculator](https://img.shields.io/badge/status-active-success.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🌟 Features

- **Real-time Data Scraping**: Fetches current cost data from Numbeo.com for 9,000+ cities worldwide
- **Reddit Integration**: Displays recent community discussions about cost of living from relevant subreddits
- **Comprehensive Cost Breakdown**: Housing, food, transportation, utilities, and entertainment estimates
- **Dual Data Sources**: Combines quantitative data (Numbeo) with qualitative insights (Reddit)
- **Fallback System**: Pre-loaded data for major cities ensures reliability
- **Beautiful UI**: Clean, responsive interface with gradient design and animated loading states
- **100% Free**: No paid APIs required - completely free to run

## 🚀 Demo

Search any major city to see:
- Monthly rent (city center vs. outside)
- Food and grocery costs
- Transportation expenses
- Utility bills
- Entertainment budget
- Total estimated monthly cost
- Recent Reddit discussions from locals and expats

**Try these cities**: New York, Los Angeles, San Francisco, Seattle, Austin, Boston, Chicago, Mountain View, London, Tokyo, Paris, Singapore, and thousands more!

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web server framework
- **Axios** - HTTP client for API requests
- **Cheerio** - Web scraping (jQuery-like HTML parser)
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5/CSS3** - Structure and styling
- **JavaScript (Vanilla)** - Client-side logic
- **Gradient Design** - Modern, professional UI

### APIs & Data Sources
- **Numbeo** - World's largest cost of living database (web scraping)
- **Reddit API** - Community discussions and real experiences (free tier)

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, Safari)

## ⚙️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/pelzade127/cost-of-living-calculator.git
cd cost-of-living-calculator
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the backend server**
```bash
npm start
```

You should see:
```
✅ Cost of Living API v2.0 is running!
🌐 Server: http://localhost:3001
```

4. **Open the frontend**
- Simply open `index.html` in your web browser
- Or use a local server like Live Server (VS Code extension)

## 📁 Project Structure

```
cost-of-living-calculator/
├── server.js           # Backend API with scraping logic
├── index.html          # Frontend interface
├── package.json        # Dependencies and scripts
└── README.md          # Project documentation
```

## 🎯 How It Works

### Data Flow

```
User Input (City Name)
    ↓
Frontend (index.html)
    ↓
HTTP Request to Backend API
    ↓
Backend (server.js)
    ├─→ Scrape Numbeo.com for cost data
    ├─→ Query Reddit API for discussions
    └─→ Aggregate and format data
    ↓
JSON Response
    ↓
Display Results in UI
```

### Backend Architecture

1. **Web Scraping**: Uses Cheerio to parse Numbeo's HTML and extract pricing data
2. **API Integration**: Calls Reddit's public search API to find relevant discussions
3. **Data Aggregation**: Combines multiple data points and calculates estimates
4. **Fallback System**: Returns pre-loaded data if scraping fails
5. **Error Handling**: Graceful degradation with helpful error messages

### Key Algorithms

- **Price Parsing**: Extracts numeric values from formatted currency strings
- **City Normalization**: Handles various city name formats (with/without state codes)
- **Grocery Estimation**: Calculates monthly grocery costs based on restaurant meal prices
- **Entertainment Budget**: Estimates leisure spending from average meal costs

## 🔑 API Endpoints

### `GET /health`
Health check endpoint
```json
{
  "status": "ok",
  "message": "Cost of Living API is running",
  "timestamp": "2024-10-06T12:00:00.000Z"
}
```

### `GET /api/cost-of-living/:city`
Get cost of living data for a specific city

**Parameters:**
- `city` (string) - City name (e.g., "New York", "Los Angeles, CA")

**Response:**
```json
{
  "city": "New York",
  "currency": "USD",
  "lastUpdated": "10/6/2024",
  "categories": {
    "housing": {
      "label": "Housing (1-bedroom apt)",
      "cityCenter": 3500,
      "outside": 2500
    },
    "food": { "label": "Food & Groceries", "monthly": 400 },
    "transportation": { "label": "Transportation", "monthly": 127 },
    "utilities": { "label": "Utilities", "monthly": 150 },
    "entertainment": { "label": "Entertainment", "monthly": 200 }
  },
  "sources": ["Numbeo.com (live)", "Reddit discussions"],
  "redditDiscussions": [...]
}
```

## 🌍 Supported Cities

The application works for:
- **9,000+ cities** worldwide via Numbeo scraping
- **Guaranteed working cities** (with fallback data):
  - US: New York, Los Angeles, San Francisco, Seattle, Austin, Boston, Chicago, Mountain View
  - International: London, Tokyo, Paris, Singapore

## 🎨 Features Breakdown

### Data Accuracy
- Real-time scraping from Numbeo's constantly-updated database
- Community-sourced data from millions of contributors
- Cross-validation with Reddit community discussions

### User Experience
- Instant search with loading states
- Clear error messages with suggestions
- Responsive design works on all devices
- Visual hierarchy with color-coded categories
- Direct links to Reddit discussions for deeper research

### Technical Excellence
- RESTful API design
- Async/await for non-blocking operations
- Promise.all() for parallel data fetching
- Comprehensive error handling
- CORS enabled for frontend communication
- Detailed console logging for debugging

## 🚧 Future Enhancements

- [ ] Add database (MongoDB/PostgreSQL) for historical data tracking
- [ ] Implement caching (Redis) to reduce API calls
- [ ] Create React frontend with state management
- [ ] Add city comparison feature (side-by-side)
- [ ] Support multiple currencies with conversion
- [ ] Add data visualization (charts with Recharts/D3.js)
- [ ] Implement user authentication for saved searches
- [ ] Add more data sources (Expatistan, Mercer, EIU)
- [ ] Build mobile app (React Native)
- [ ] Add quality of life metrics (safety, healthcare, pollution)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is [MIT](LICENSE) licensed.

## 🙏 Acknowledgments

- **Numbeo** - For providing free access to their comprehensive cost of living database
- **Reddit** - For their open API enabling community insights
- **Express.js** - For the excellent web framework
- **Cheerio** - For making web scraping simple and elegant

## 📧 Contact

Esther Ademuwagun - estherade127@gmail.com

Project Link: [https://github.com/pelzade127/cost-of-living-calculator]

---

## 💡 About This Project

This project was built to solve a real problem: making informed relocation decisions. Whether you're considering a job offer in a new city, planning to study abroad, or exploring digital nomad destinations, understanding the true cost of living is crucial.

By combining hard data from Numbeo with real experiences from Reddit, this tool provides both the numbers and the context you need to make smart decisions.

**Built with ❤️ using Node.js and modern web technologies**