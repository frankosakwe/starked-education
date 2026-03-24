# Starked Education - Course Enrollment System

A complete course enrollment interface with Stellar blockchain payment processing, wallet connection, and multi-step enrollment flow.

## Features

- **Multi-step Enrollment Process**: Guided enrollment with personal info, wallet connection, and payment steps
- **Stellar Wallet Integration**: Connect and sign transactions using Freighter wallet
- **Payment Processing**: Secure Stellar blockchain transactions with confirmation
- **Real-time Transaction Status**: Track payment progress and receive receipts
- **Error Handling**: Comprehensive error handling for failed transactions
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **Blockchain**: Stellar SDK, Freighter wallet integration
- **State Management**: React hooks
- **API**: Next.js API routes

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── enroll/[courseId]/page.tsx    # Main enrollment page
│   │   ├── api/enroll/route.ts            # Enrollment API endpoint
│   │   ├── layout.tsx                     # Root layout
│   │   └── globals.css                   # Global styles
│   ├── components/
│   │   ├── EnrollmentForm.tsx            # Multi-step enrollment form
│   │   ├── WalletConnector.tsx           # Wallet connection component
│   │   └── PaymentProcessor.tsx          # Payment handling component
│   ├── lib/
│   │   └── stellar.ts                    # Stellar transaction utilities
│   └── types/
│       └── enrollment.ts                 # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Freighter wallet browser extension installed
- Stellar testnet account (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/frankosakwe/starked-education.git
cd starked-education/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure your Stellar wallet address:
```
NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS=GDQD23O6DZGMZCB76DGN4Q5PQIYXKQDN7B2JIV5KJEB2VZQKUCVXIH23
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing the Enrollment Flow

1. Navigate to `/enroll/stellar-development-course` (or any course ID)
2. Complete the personal information form
3. Connect your Freighter wallet
4. Complete the payment using Stellar testnet XLM
5. Receive confirmation and receipt

## Key Components

### EnrollmentForm
Multi-step form component that handles:
- Personal information collection
- Wallet connection
- Payment processing
- Progress tracking

### WalletConnector
Handles Stellar wallet integration:
- Connect/disconnect Freighter wallet
- Display wallet balance and address
- Network switching (testnet/mainnet)

### PaymentProcessor
Manages Stellar transactions:
- Transaction preparation and signing
- Payment confirmation
- Error handling and retries
- Receipt generation

### Stellar Service
Core Stellar blockchain utilities:
- Wallet connection management
- Transaction creation and signing
- Balance checking
- Transaction verification

## API Endpoints

### POST /api/enroll
Processes course enrollment requests.

**Request Body:**
```json
{
  "courseId": "stellar-development-course",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  },
  "paymentInfo": {
    "method": "stellar",
    "walletAddress": "GD...",
    "transactionHash": "tx_hash_here"
  },
  "amount": 50.00,
  "currency": "XLM"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseId": "stellar-development-course",
    "userId": "john.doe@example.com",
    "walletAddress": "GD...",
    "paymentStatus": "completed",
    "enrollmentDate": "2024-01-15T10:30:00Z",
    "amount": 50.00,
    "currency": "XLM",
    "transactionHash": "tx_hash_here"
  },
  "receipt": {
    "id": "receipt_1234567890",
    "enrollmentId": "john.doe@example.com",
    "courseId": "stellar-development-course",
    "amount": 50.00,
    "currency": "XLM",
    "transactionHash": "tx_hash_here",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "completed",
    "walletAddress": "GD..."
  }
}
```

## Environment Variables

- `NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS`: Your platform's Stellar wallet address for receiving payments
- `NEXTAUTH_URL`: Application URL (for authentication if implemented)
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `DATABASE_URL`: Database connection string
- `EMAIL_FROM`: From email address for notifications
- `RESEND_API_KEY`: API key for email service

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## Security Considerations

- Always validate transaction amounts on the server-side
- Implement rate limiting on API endpoints
- Use HTTPS in production
- Validate all user inputs
- Store sensitive keys securely (environment variables)
- Implement proper authentication and authorization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@starked-education.com

## Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for the blockchain infrastructure
- [Freighter](https://www.freighter.app/) for the wallet integration
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
