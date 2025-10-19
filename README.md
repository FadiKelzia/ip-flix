# IP Information Display - ip.tmflix.com

Beautiful, high-performance IP address and network information display built with Next.js 15 and Liquid Glass design aesthetic.

## Features

### Instant Information (Server-Side)
- Public IP Address (IPv4/IPv6)
- Geolocation (Country, City, Region, Coordinates)
- Browser & OS Detection
- Device Type Detection
- Timezone Information

### Detailed Information (On-Demand)
- ISP & Organization
- ASN (Autonomous System Number)
- Hostname
- Network Details
- Security Information (VPN/Proxy Detection)

### Privacy Audit (/privacy)
Comprehensive browser privacy analysis with user consent:
- **Browser Fingerprinting**: Canvas, WebGL, Audio fingerprints
- **Device Info**: Hardware specs, screen, CPU, memory
- **Network Privacy**: WebRTC IP leaks, connection details
- **Tracking Detection**: Cookies, storage, third-party trackers
- **Privacy Score**: 0-100 rating with recommendations
- **Ad Blocker Detection**: Identifies privacy tools
- **Incognito Detection**: Private browsing analysis
- **Advanced Analysis** (CreepJS-inspired):
  - **Trust Score** (0-100): Browser tampering & lie detection
  - **Bot Score** (0-100): Automation & bot detection
  - **Advanced Hardware**: GPU fingerprint, battery status
  - **Speech & Media**: Voice enumeration, device detection
  - **Behavioral Tracking**: Mouse, keyboard, touch patterns
  - **API Fingerprinting**: Math precision, error formats
- All analysis runs **client-side only** - educational purpose

### Threat Intelligence (Main Page)
Real-time threat analysis displayed after "Show Detailed Network Information":
- **Threat Score** (0-100): ML-powered risk assessment
- **Threat Levels**: Safe, Low, Medium, High, Critical
- **VPN/Proxy/Tor Detection**: Anonymization identification
- **Hosting Provider**: Cloud & datacenter detection
- **Company Information**: Organization details & domain
- **ASN Details**: Complete autonomous system data
- **Bot Detection**: Automated traffic identification
- **Usage Type**: Residential, business, hosting, cloud, government

### OSINT Intelligence (/intel) - NEW!
External threat intelligence and exposed services analysis:
- **Shodan InternetDB** (FREE - no API key required):
  - Exposed ports and services
  - Known vulnerabilities (CVEs)
  - Service banners and tags
  - Associated hostnames
- **AbuseIPDB** (optional - free tier):
  - Abuse confidence score (0-100%)
  - Attack reports and categories
  - Blacklist status
- **Risk Assessment**: Security score with recommendations
- **Explicit Consent**: Strong warnings & disclaimers
- All queries to external databases (educational purpose)

### Design
- **Liquid Glass UI**: Apple-inspired glassmorphism design
- **Dark Mode**: Black background with frosted glass panels
- **Lightweight Animations**: Subtle fade-in and slide-up effects
- **High Performance**: Edge runtime, minimal JavaScript, optimized assets

## Tech Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **Runtime**: Vercel Edge Functions
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **APIs**: Free-tier geolocation services (ipapi.co, ip-api.com)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The development server runs on `http://localhost:3002`

## Deployment

### Vercel Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Use account: fadi@kelzia.com

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Configure Custom Domain**:
   - In Vercel dashboard, go to project settings
   - Add custom domain: `ip.tmflix.com`
   - Update DNS records at your domain provider:
     - Add CNAME record: `ip` → `cname.vercel-dns.com`

### DNS Configuration

For `ip.tmflix.com` on Cloudflare:
```
Type: CNAME
Name: ip
Target: cname.vercel-dns.com
Proxy: Yes (orange cloud)
```

## API Endpoints

### GET /ip
Returns **only your IP address** in plain text format - perfect for curl commands!

**Usage:**
```bash
curl https://ip.tmflix.com/ip
# Output: 1.2.3.4

# Use in scripts
MY_IP=$(curl -s https://ip.tmflix.com/ip)
echo "My IP is: $MY_IP"
```

**Response:**
```
1.2.3.4
```

---

### GET /api/ip
Returns complete IP information as JSON.

**Response:**
```json
{
  "ip": "1.2.3.4",
  "ipVersion": "IPv4",
  "country": "United States",
  "countryCode": "US",
  "city": "New York",
  "region": "New York",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York",
  "browser": "Chrome",
  "os": "Windows 10/11",
  "device": "Desktop",
  "timestamp": "2025-01-19T12:00:00.000Z"
}
```

### GET /api/ip/details?ip=1.2.3.4
Returns detailed network information for a specific IP.

**Response:**
```json
{
  "isp": "Example ISP",
  "org": "Example Organization",
  "asn": "AS12345",
  "hostname": "example.com",
  "security": {
    "isVpn": false,
    "isProxy": false,
    "isTor": false
  }
}
```

## Performance

- **Bundle Size**: < 100KB (JavaScript)
- **First Contentful Paint**: < 0.5s
- **Time to Interactive**: < 1s
- **Edge Runtime**: Global CDN distribution
- **API Response Time**: < 200ms

## License

Private project for TMFlix network tools.
