# Top Signals Browser - Farcaster Mini App

A SocialFi/Analytics mini-app for discovering top cryptocurrency signals based on LunarCrush API data, built on Farcaster and Arbitrum.

## 🚀 Features

### Core Functionality
- **Top Signals Browser**: Discover top ↑/↓ tokens by hx_mom6 momentum signals
- **Token Detail View**: Tap tokens for detailed analysis with driver chips (Buzz/Liq/Rank)
- **Watchlist Management**: Save and track your favorite tokens
- **Researcher NFT**: Mint exclusive NFTs after analyzing 50+ tokens

### Signal Metrics
- **hx_mom6**: 6-hour momentum prediction score
- **hx_buzz6**: Social attention spike percentage
- **hx_liq6**: Liquidity impulse (market depth change)
- **hx_rankimp6**: Relative market improvement
- **hx_sent6**: Sentiment swing percentage
- **hx_ret6**: Realized return over 6 hours

### Smart Contract Features
- **Token View Tracking**: Increment counter on first view each tick
- **Researcher NFT Minting**: Award NFTs to users who analyze 50+ tokens
- **Eligibility System**: Track user progress toward NFT eligibility
- **Arbitrum Sepolia Deployment**: Deployed on Arbitrum's testnet

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Smart Contracts**: Rust + Arbitrum Stylus + OpenZeppelin
- **Wallet Integration**: wagmi + viem + Farcaster Frame
- **Data Source**: LunarCrush API (mock data for MVP)
- **Deployment**: Arbitrum Sepolia Testnet

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Rust 1.70+
- pnpm
- Arbitrum Stylus CLI

### Quick Start

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd farcaster-mini-app
pnpm install
```

2. **Deploy Smart Contract**
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy to Arbitrum Sepolia
./scripts/deploy.sh
```

3. **Update Contract Address**
```bash
# After deployment, update the contract address in:
# frontend/src/App.tsx
CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS"
```

4. **Run Frontend**
```bash
pnpm --filter frontend dev
```

5. **Test on Farcaster**
- Use ngrok to expose your local server
- Test with Farcaster Mini-App Previewer

## 🎯 Usage Guide

### For Users
1. **Connect Wallet**: Use Farcaster Frame or browser wallet
2. **Browse Signals**: View top gainers/losers by momentum
3. **Analyze Tokens**: Tap tokens for detailed analysis
4. **Build Watchlist**: Star tokens to track later
5. **Earn NFT**: Analyze 50+ tokens to mint Researcher NFT

### For Developers
1. **Contract Development**: Modify `contracts/template/src/lib.rs`
2. **Frontend Customization**: Update components in `frontend/src/components/`
3. **API Integration**: Replace mock data in `frontend/src/services/signalsAPI.ts`
4. **Styling**: Customize with Tailwind CSS classes

## 📊 API Integration

The app currently uses mock data based on LunarCrush API structure. To integrate with real LunarCrush API:

1. **Get API Key**: Sign up at [LunarCrush](https://lunarcrush.com/)
2. **Update API Service**: Modify `signalsAPI.ts` to use real endpoints
3. **Rate Limiting**: Implement proper rate limiting (LunarCrush: 10 requests/minute)
4. **Data Processing**: Apply the hx_mom6 equations from the API documentation

### LunarCrush API Endpoints
- **Time Series**: `/api4/public/coins/{coin}/time-series/v2`
- **Parameters**: `bucket=hour&start={timestamp}&end={timestamp}`
- **Authentication**: Bearer token

## 🔧 Smart Contract Details

### TopSignalsBrowserContract
- **ERC721**: Inherits from OpenZeppelin Stylus ERC721
- **View Tracking**: `trackTokenView(address user)` increments user's view count
- **NFT Eligibility**: `isResearcherEligible(address user)` checks if user can mint
- **NFT Minting**: `mintResearcherNft()` mints NFT to eligible users
- **Progress Tracking**: `getUserViews(address user)` returns view count

### Key Functions
```rust
// Track a token view
pub fn track_token_view(&mut self, user: Address) -> Result<(), Vec<u8>>

// Mint Researcher NFT
pub fn mint_researcher_nft(&mut self) -> Result<(), Vec<u8>>

// Check eligibility
pub fn is_researcher_eligible(&self, user: Address) -> Result<bool, Vec<u8>>
```

## 🎨 UI Components

### TokenSignalCard
- Displays token symbol, type, and momentum signal
- Shows signal drivers (Buzz, Liquidity, Rank)
- Watchlist toggle functionality
- Responsive grid layout

### TokenDetailView
- Comprehensive token analysis
- Signal driver breakdown
- Market data and social metrics
- Social links and website

### ResearcherNFT
- Progress tracking toward NFT eligibility
- Visual progress bar
- Mint button when eligible
- NFT preview

## 🚀 Deployment

### Arbitrum Sepolia
```bash
# Deploy contract
cargo stylus deploy --network arbitrum-sepolia

# Verify contract (optional)
cargo stylus verify --network arbitrum-sepolia
```

### Frontend Deployment
```bash
# Build for production
pnpm --filter frontend build

# Deploy to your preferred hosting service
# (Vercel, Netlify, etc.)
```

## 🔗 Links

- **Arbitrum Sepolia**: https://sepolia.arbiscan.io/
- **Farcaster Docs**: https://docs.farcaster.xyz/
- **LunarCrush API**: https://lunarcrush.com/api
- **Arbitrum Stylus**: https://arbitrum.io/stylus

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Known Issues

- Mock data used instead of real LunarCrush API
- Contract address needs manual update after deployment
- Limited error handling for API failures

## 🔮 Future Enhancements

- Real-time LunarCrush API integration
- Advanced filtering and sorting options
- Social features (comments, ratings)
- Mobile app version
- Additional NFT tiers
- Cross-chain support
