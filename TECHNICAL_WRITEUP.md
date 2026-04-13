# MSME Lending Decision System

## Technical Documentation

---

## 1. Introduction

The **MSME Lending Decision System** is an automated credit decisioning platform designed to evaluate loan applications from Micro, Small and Medium Enterprises (MSMEs). The system addresses a critical challenge in fintech: providing fast, consistent, and transparent credit decisions for small businesses that often lack extensive credit history.

### Problem Statement
Traditional lending processes for MSMEs are slow, manual, and inconsistent. Small business owners face lengthy approval cycles (weeks), while lenders struggle with high default rates due to inadequate risk assessment.

### Scope
This system delivers:
- **Automated application intake** via REST API
- **Real-time credit scoring** with transparent decision logic
- **Instant approve/reject decisions** with detailed reasoning
- **Comprehensive audit logging** for compliance and review

---

## 2. System Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React + TypeScript + Tailwind CSS | User interface for loan applications |
| **Backend** | Node.js + Express + TypeScript | API server and decision engine |
| **Primary Database** | PostgreSQL | Business, loan, and decision data |
| **Logging Database** | MongoDB | Application logs and audit trails |

### Architecture Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│   Express    │────▶│ PostgreSQL  │
│  Frontend   │◀────│   Backend    │◀────│  (Data)     │
└─────────────┘     └──────────────┘     └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   MongoDB    │
                     │   (Logs)     │
                     └──────────────┘
```

### API Flow

1. **Request**: Frontend submits loan application (`POST /api/decision`)
2. **Validation**: Zod schema validates inputs (PAN format, positive revenue, etc.)
3. **Processing**: Decision engine calculates credit score using business logic
4. **Persistence**: Decision stored in PostgreSQL with full audit trail
5. **Response**: JSON response with `decision`, `credit_score`, and `reasons`

### Deployment
- **Backend**: Render (Docker container with auto-deploy)
- **Frontend**: Vercel (CI/CD from GitHub)
- **Database**: Render PostgreSQL + MongoDB Atlas

---

## 3. Decision Engine Logic

The scoring engine evaluates loan applications on a **100-point scale**, applying deductions for risk factors. A score ≥ 70 results in approval; below 70 results in rejection.

### Scoring Methodology

| Factor | Weight | Logic |
|--------|--------|-------|
| **Base Score** | 100 | Starting point for all applicants |
| **Revenue-to-EMI Ratio** | -20 to -30 | Deducts if EMI exceeds 30% of monthly revenue |
| **Loan-to-Revenue Ratio** | -15 to -25 | Deducts if loan amount exceeds 3x annual revenue |
| **Tenure Risk** | -5 to -10 | Longer tenures (>24 months) carry higher risk |
| **Fraud Checks** | -100 | Hard reject on invalid PAN or duplicate applications |

### Key Thresholds

- **Revenue-to-EMI**: EMI should not exceed 30% of monthly revenue
  - *Rationale*: Ensures borrower can service debt without operational stress
  
- **Loan-to-Revenue**: Maximum 3:1 ratio (loan : annual revenue)
  - *Rationale*: Prevents over-leveraging relative to business capacity

- **Tenure Risk**: Loans >24 months lose 10 points
  - *Rationale*: Extended exposure increases default probability

### Decision Output Example

```json
{
  "decision": "REJECTED",
  "credit_score": 55,
  "reasons": [
    "EMI exceeds 30% of monthly revenue",
    "Loan amount exceeds 3x annual revenue"
  ],
  "details": {
    "monthly_emi": 15000,
    "revenue_to_emi_ratio": "50%"
  }
}
```

---

## 4. Trade-offs & Design Decisions

Given project timeline constraints, several intentional trade-offs were made:

### Simplified EMI Calculation
- **Decision**: Used flat-rate EMI formula instead of reducing balance
- **Rationale**: Faster computation, acceptable for proof-of-concept; real implementation would use standard reducing balance method

### Synchronous Processing
- **Decision**: API returns decisions immediately (no async queue)
- **Rationale**: Lower complexity for MVP; production would use Redis/RabbitMQ for high-volume processing

### Mock Credit Bureau
- **Decision**: No integration with CIBIL/Experian APIs
- **Rationale**: Avoid external API dependencies and costs; real implementation would pull credit reports

### Single-Tenant Design
- **Decision**: No multi-bank or user authentication
- **Rationale**: Focused on core decision engine; auth layer easily added via JWT/OAuth

### Static Scoring Model
- **Decision**: Rule-based scoring instead of ML
- **Rationale**: Explainability and transparency for regulatory compliance; ML model requires training data

---

## 5. Edge Case Handling

The system implements defensive validation at multiple layers:

| Edge Case | Handling Strategy |
|-----------|-------------------|
| **Invalid PAN** | Zod regex validation (`[A-Z]{5}[0-9]{4}[A-Z]{1}`); returns 400 with field error |
| **Missing Fields** | Required field validation; returns detailed error messages |
| **Negative Revenue** | Schema constraint (`monthly_revenue > 0`); rejected at validation layer |
| **Duplicate PAN** | Database unique constraint; prevents duplicate business registration |
| **Unrealistic Loan Amount** | Business rule validation; flagged in decision logic |
| **Database Unavailable** | Graceful error handling with 500 response and logging |

### Error Response Format

```json
{
  "error": "Validation failed",
  "details": "Invalid PAN format",
  "field": "pan"
}
```

---

## 6. Improvements (Future Scope)

### Phase 1: Core Enhancements
- **Machine Learning Scoring**: Train model on historical decisions for predictive accuracy
- **Credit Bureau Integration**: Connect to CIBIL/Equifax for credit history
- **Document Upload**: Support GST returns, bank statements for income verification

### Phase 2: Operational
- **Async Processing**: Implement Redis queue for high-volume periods
- **Admin Dashboard**: Review decisions, override rejections, track portfolio performance
- **Authentication**: JWT-based auth for API security and user management

### Phase 3: Scale
- **Multi-tenant Support**: White-label for multiple lending partners
- **Real-time Notifications**: SMS/email alerts for application status
- **Analytics Dashboard**: Portfolio metrics, default rates, approval trends

---

## Conclusion

The MSME Lending Decision System demonstrates a production-ready approach to automated credit decisioning. The modular architecture allows for incremental enhancements, while the transparent scoring logic ensures regulatory compliance and business trust. The system balances technical sophistication with practical deployment constraints, making it suitable for both demonstration and production iteration.

---

**Built by**: Karan Parmar  
**Tech Stack**: React, TypeScript, Node.js, Express, PostgreSQL, MongoDB  
**Deployment**: Render + Vercel  
**Repository**: github.com/Karan9186/msme-lending
