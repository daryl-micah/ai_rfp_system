# AI-Powered RFP Management System

A modern web application that streamlines the Request for Proposal (RFP) procurement workflow using AI. Built with Next.js, PostgreSQL, and LLM integration.

## 🎯 Features

### 1. Create RFPs with Natural Language

- Describe procurement needs in plain English
- AI automatically structures input into a standardized RFP format
- Extracts items, budget, delivery timeline, payment terms, and requirements

### 2. Vendor Management

- Maintain a vendor master database
- Store vendor contact information and communication history
- Select vendors for specific RFPs

### 3. Email Integration

- **Send RFPs**: Automatically email RFPs to selected vendors
- **Receive Proposals**: Poll IMAP inbox for vendor responses
- **Auto-parse**: AI extracts pricing, delivery terms, warranty info from email responses

### 4. AI-Powered Comparison

- View all proposals side-by-side in a comparison table
- AI-generated summaries for each proposal
- Get AI recommendations on the best vendor based on multiple criteria

## 🏗️ Architecture & Design Decisions

### Tech Stack

**Frontend:**

- **Next.js 16** (App Router) - Modern React framework with server/client components
- **Tailwind CSS** - Utility-first CSS for rapid UI development
- **TypeScript** - Type safety across the application

**Backend:**

- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe SQL query builder
- **PostgreSQL** (Neon) - Reliable relational database for structured data

**AI Integration:**

- **Groq (Llama 3.1)** - Fast, cost-effective LLM for:
  - Structuring RFPs from natural language
  - Parsing vendor emails
  - Generating proposal summaries
  - Comparing and recommending vendors

**Email:**

- **Nodemailer** (SMTP) - Sending RFPs to vendors
- **ImapFlow** (IMAP) - Receiving and processing vendor responses

### Data Model

```typescript
// RFPs - Procurement requests
rfps {
  id: serial
  title: text
  description: text
  structured: jsonb          // AI-structured RFP data
  createdAt: timestamp
}

// Vendors - Vendor master data
vendors {
  id: serial
  name: text
  email: text (required)
  contact: text
  createdAt: timestamp
}

// Proposals - Vendor responses
proposals {
  id: serial
  rfpId: integer -> rfps.id
  vendorId: integer -> vendors.id
  parsed: jsonb              // AI-extracted proposal data
  aiSummary: text            // AI-generated summary
  rawEmail: text             // Original email for reference
  createdAt: timestamp
}
```

### Key Design Decisions

1. **JSONB for Flexibility**: RFP structure and proposal data stored as JSONB to handle varying formats without schema changes

2. **AI-First Approach**: AI handles the heavy lifting of data extraction and analysis, reducing manual data entry

3. **Email-Based Workflow**: Uses standard email protocols (SMTP/IMAP) - no special vendor portals required

4. **Single-User Focus**: Optimized for individual procurement managers; no multi-tenant complexity

5. **Groq for Speed**: Chose Groq's Llama model for fast inference and cost efficiency

## 📋 Prerequisites

- **Node.js** 18+ and pnpm/npm
- **PostgreSQL** database (we recommend [Neon](https://neon.tech) for serverless Postgres)
- **Gmail Account** with App Password or OAuth2 for email integration
- **Groq API Key** ([Get one free here](https://console.groq.com))

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai_rfp_system
pnpm install  # or npm install
```

### 2. Database Setup

Create a PostgreSQL database (Neon recommended):

```bash
# Run migrations
pnpm drizzle-kit push
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Groq AI
GROQ_API_KEY="your_groq_api_key"

# Email Sending (SMTP)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Email Receiving (IMAP) - OAuth2 recommended for Gmail
IMAP_USER="your-email@gmail.com"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REFRESH_TOKEN="your-refresh-token"
```

### 4. Gmail Setup for Email Integration

#### For SMTP (Sending):

1. Enable 2FA on your Google account
2. Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use this as `SMTP_PASS`

#### For IMAP (Receiving):

OAuth2 is recommended. Follow these steps:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Gmail API
3. Create OAuth2 credentials
4. Use the [OAuth2 Playground](https://developers.google.com/oauthplayground/) to get a refresh token
5. Add credentials to `.env.local`

### 5. Run the Application

```bash
pnpm dev
```

Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 🎮 How to Use

### End-to-End Workflow

1. **Create an RFP**

   - Navigate to "Create RFP"
   - Describe what you want to procure in natural language
   - AI structures it into a standardized RFP

2. **Add Vendors**

   - Go to "Vendors" page
   - Add vendor details (name, email, contact)

3. **Send RFP to Vendors**

   - Open the RFP detail page
   - Select vendors from the list
   - Click "Send to Vendors"
   - RFP is emailed automatically

4. **Receive Proposals**

   - Vendors reply to the email with their proposals
   - System polls IMAP inbox for new emails
   - AI automatically extracts pricing, terms, and delivery info
   - Proposals appear on the RFP detail page

5. **Compare & Decide**
   - Click "Compare Proposals" button
   - View side-by-side comparison table
   - Review AI summaries for each proposal
   - Get AI recommendation on best vendor

### Manual Email Polling

To manually check for new vendor emails:

```bash
curl http://localhost:3000/api/email/poll
```

Or set up a cron job to poll every few minutes.

## 🧪 Testing the System

### Quick Test with Dummy Data

1. Create an RFP using this example:

   ```
   I need to procure laptops and monitors for our new office.
   Budget is $50,000 total. Need delivery within 30 days.
   We need 20 laptops with 16GB RAM and 15 monitors 27-inch.
   Payment terms should be net 30, and we need at least 1 year warranty.
   ```

2. Add test vendors with your own email addresses

3. Send RFP to yourself

4. Reply with a proposal email like:

   ```
   Thank you for your RFP request.

   We can provide:
   - 20 Dell Laptops with 16GB RAM @ $800 each = $16,000
   - 15 Samsung 27" Monitors @ $300 each = $4,500

   Total: $20,500
   Delivery: 15 days
   Warranty: 2 years
   Payment Terms: Net 30
   ```

5. Poll emails and see the proposal appear with AI-parsed data

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── email/
│   │   │   ├── send/          # Send RFP emails
│   │   │   └── poll/          # Poll IMAP for responses
│   │   ├── rfps/              # RFP CRUD operations
│   │   ├── vendors/           # Vendor management
│   │   └── send-rfp/          # Bulk send to multiple vendors
│   ├── components/            # Reusable components
│   ├── dashboard/             # Main dashboard
│   ├── rfps/                  # RFP pages
│   ├── compare/               # Proposal comparison
│   └── vendors/               # Vendor management page
├── db/
│   ├── schema.ts              # Database schema
│   └── drizzle.ts             # DB connection
├── lib/
│   ├── llmClient.ts           # AI/LLM utilities
│   ├── emailClient.ts         # SMTP client
│   ├── imapClient.ts          # IMAP client
│   └── getAccessToken.ts      # OAuth2 for Gmail
└── drizzle.config.ts          # Drizzle ORM config
```

## 🤖 AI Integration Details

### 1. RFP Structuring

**Prompt Strategy**: Zero-shot structured output

```typescript
Input: Natural language procurement description
Output: {
  title: string
  items: [{name, qty, specs}]
  budget: number
  delivery_timeline: string
  payment_terms: string
  notes: string
}
```

### 2. Email Parsing

**Prompt Strategy**: Information extraction

```typescript
Input: Raw email body
Output: {
  price: number
  delivery_days: number
  warranty: string
  terms: string
  notes: string
}
```

### 3. Proposal Comparison

**Prompt Strategy**: Multi-criteria decision analysis

```typescript
Input: Array of parsed proposals
Output: {
  winner: vendorId
  explanation: string (rationale)
}
Criteria: price, delivery speed, warranty, terms, risk assessment
```

## 🔐 Security Considerations

- **Email credentials**: Stored in environment variables, never committed
- **OAuth2**: Recommended over app passwords for Gmail access
- **Input validation**: All user inputs sanitized before DB insertion
- **SQL injection**: Protected via Drizzle ORM parameterized queries

## 🎯 Future Enhancements

- **RFP Templates**: Predefined templates for common procurement types
- **Attachment Parsing**: Extract data from PDF/Excel vendor proposals
- **Multi-RFP Tracking**: Track which RFP was sent to which vendor
- **Automated Polling**: Background job to check emails periodically
- **Vendor Ratings**: Historical performance tracking
- **Export**: Generate comparison reports as PDF

## 📝 Assumptions & Limitations

1. **Single User**: No authentication or multi-user support
2. **Email-based**: Vendors must reply via email (no web portal)
3. **Latest RFP Matching**: System matches incoming emails to the most recent RFP
4. **Gmail Focus**: Email integration optimized for Gmail (adaptable to others)
5. **English Only**: AI prompts and parsing designed for English text
6. **Structured Responses**: Works best when vendors provide clear, structured proposals

## 🛠️ Troubleshooting

### "Failed to send email"

- Check SMTP credentials in `.env.local`
- Verify Gmail App Password or OAuth2 token is valid
- Ensure "Less secure apps" is enabled (if using app password)

### "No proposals appearing"

- Run `/api/email/poll` manually to check for errors
- Verify vendor email matches one in your database
- Check if email passed spam filters
- Review browser console for parsing errors

### "AI parsing returns null/empty"

- Check Groq API key is valid
- Verify email format is reasonable (not pure HTML)
- Review `lib/llmClient.ts` prompts for debugging

## 📄 License

MIT

## 👤 Author

Built as a demonstration of AI-powered workflow automation for procurement management.

---

**Tech Stack Summary**: Next.js 16 | PostgreSQL | Drizzle ORM | Groq (Llama 3.1) | Tailwind CSS | Nodemailer | ImapFlow
