# MSME Lending Decision System

A production-ready full-stack application for MSME (Micro, Small and Medium Enterprises) loan application processing with an automated credit decision engine.

## Features

- **Automated Credit Decision Engine**: Real-time loan approval/rejection based on multiple risk factors
- **Clean Architecture**: Separation of concerns with modular code structure
- **Form Validation**: Both frontend (Zod + React Hook Form) and backend (Zod) validation
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Rate Limiting**: API protection against abuse (10 requests/minute)
- **Logging**: Winston logger with MongoDB storage for audit trails
- **Security**: Helmet.js for security headers, CORS protection
- **Docker Support**: Complete containerization with Docker Compose

## Tech Stack

### Backend
- **Node.js** + **Express** with **TypeScript**
- **PostgreSQL** for structured data storage
- **MongoDB** for logging and audit trails
- **Zod** for request validation
- **Winston** for logging
- **Helmet** & **CORS** for security

### Frontend
- **React** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Hook Form** + **Zod** for form handling
- **Axios** for API calls
- **Lucide React** for icons

## Project Structure

```
/backend
  /src
    /config         # Database, logger configs
    /controllers    # Route handlers
    /middleware     # Validation, error handling, rate limiting, logging
    /models         # Database models
    /routes         # API route definitions
    /services       # Business logic (decision engine)
    /types          # TypeScript interfaces
    /validators     # Zod schemas
    /utils          # Utility functions
  server.ts         # Entry point

/frontend
  /src
    /components     # React components
    /services       # API calls
    /types          # TypeScript types
  App.tsx           # Main application
```

## Decision Engine Logic

The credit decision engine evaluates loan applications based on:

### Scoring Criteria (Base Score: 100)

1. **EMI-to-Revenue Ratio** (Penalty: -30)
   - If EMI > 50% of monthly revenue → HIGH RISK

2. **Loan-to-Revenue Ratio** (Penalty: -40)
   - If loan > 10x monthly revenue → REJECT

3. **Tenure Risk** (Penalty: -20)
   - < 6 months or > 60 months → risky

4. **Revenue Check** (Penalty: -25)
   - Monthly revenue < ₹10,000 → LOW REVENUE

5. **Fraud Detection** (Penalty: -50)
   - Loan/revenue ratio > 20 → suspicious
   - Low revenue (< ₹20k) with high loan (> ₹5L) → fraud suspected

### Decision Thresholds
- **Score >= 60**: APPROVED
- **Score < 60**: REJECTED

### Reason Codes
- `APPROVED`: Application meets all criteria
- `LOW_REVENUE`: Monthly revenue below threshold
- `HIGH_LOAN_RATIO`: Loan exceeds 10x monthly revenue
- `HIGH_EMI`: EMI exceeds 50% of monthly revenue
- `RISKY_TENURE`: Tenure outside 6-60 months range
- `FRAUD_SUSPECTED`: Unusual loan-to-revenue ratio
- `INVALID_DATA`: Invalid or missing data

## API Documentation

### Endpoints

#### POST `/api/decision`
Main endpoint for evaluating loan applications.

**Request Body:**
```json
{
  "business": {
    "ownerName": "John Doe",
    "pan": "ABCDE1234F",
    "businessType": "retail",
    "monthlyRevenue": 50000
  },
  "loan": {
    "loanAmount": 100000,
    "tenureMonths": 12,
    "loanPurpose": "Working capital for inventory"
  }
}
```

**Response:**
```json
{
  "decision": "APPROVED",
  "creditScore": 85,
  "reasons": ["APPROVED"],
  "details": {
    "emiAmount": 8333.33,
    "emiToRevenueRatio": 0.17,
    "loanToRevenueRatio": 2,
    "revenueRiskLevel": "LOW",
    "tenureRiskLevel": "LOW",
    "fraudCheck": "PASS"
  },
  "id": "uuid",
  "businessId": "uuid",
  "loanId": "uuid"
}
```

#### POST `/api/business`
Create a new business record.

#### GET `/api/business`
Get all businesses.

#### GET `/api/business/:id`
Get business by ID.

#### POST `/api/loan/business/:businessId`
Create a loan for a business.

#### GET `/api/decision/stats`
Get decision statistics.

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+ (optional, for logging)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=msme_lending
DB_USER=postgres
DB_PASSWORD=your_password
MONGODB_URI=mongodb://localhost:27017/msme_logs
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Docker Setup (Optional)

Run the entire stack with Docker Compose:

```bash
docker-compose up -d
```

This will start:
- Backend server on port 3000
- PostgreSQL database on port 5432
- MongoDB on port 27017

## Edge Cases Handled

- **Missing Fields**: Required field validation
- **Negative Numbers**: Positive number constraints
- **Invalid PAN**: Format validation (ABCDE1234F)
- **Non-numeric Inputs**: Type coercion and validation
- **Unrealistic Values**: Maximum value constraints
- **Duplicate PAN**: Unique constraint handling
- **Database Connection Errors**: Graceful error responses
- **Rate Limiting**: 10 requests per minute for decisions

## Assumptions

1. **EMI Calculation**: Simple interest model (P/n) without considering interest rate
2. **PAN Format**: Indian PAN format (5 letters + 4 digits + 1 letter)
3. **Currency**: Indian Rupees (₹)
4. **Revenue**: Monthly revenue is the primary indicator of repayment capacity
5. **No Authentication**: Demo application without user authentication
6. **Single Decision**: Each loan application gets one decision

## Testing

### Sample Test Cases

**Case 1: Approved Application**
```json
{
  "business": {
    "ownerName": "Rajesh Kumar",
    "pan": "ABCDE1234F",
    "businessType": "retail",
    "monthlyRevenue": 100000
  },
  "loan": {
    "loanAmount": 500000,
    "tenureMonths": 24,
    "loanPurpose": "Business expansion"
  }
}
```
Expected: APPROVED (Score: ~70-90)

**Case 2: High EMI Risk**
```json
{
  "business": {
    "ownerName": "Small Shop Owner",
    "pan": "FGHIJ5678K",
    "businessType": "retail",
    "monthlyRevenue": 30000
  },
  "loan": {
    "loanAmount": 300000,
    "tenureMonths": 6,
    "loanPurpose": "Inventory"
  }
}
```
Expected: REJECTED (HIGH_EMI - EMI is ₹50k, which exceeds 50% of revenue)

**Case 3: Fraud Suspected**
```json
{
  "business": {
    "ownerName": "Suspicious Applicant",
    "pan": "KLMNO9012P",
    "businessType": "services",
    "monthlyRevenue": 15000
  },
  "loan": {
    "loanAmount": 600000,
    "tenureMonths": 12,
    "loanPurpose": "Equipment purchase"
  }
}
```
Expected: REJECTED (FRAUD_SUSPECTED - High loan for low revenue)

## Deployment

### Backend (Render/Railway)
1. Set environment variables in the dashboard
2. Deploy from GitHub repository
3. Database connection string should use the provided PostgreSQL

### Frontend (Vercel/Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variable: `VITE_API_URL` pointing to backend URL

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Document upload for KYC
- [ ] Credit bureau integration
- [ ] Email notifications
- [ ] Admin dashboard for loan officers
- [ ] Machine learning risk scoring
- [ ] Multi-language support

## License

MIT License

## Contact

For questions or support, please open an issue in the repository.
