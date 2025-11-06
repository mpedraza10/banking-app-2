# API Specification: Corporate Cash System

## 1. API Overview

**Authentication:** JWT token required in Authorization header for all endpoints
**Purpose:** Provide endpoints for cashier operations including customer management, service payments, card payments, and cash handling

## 2. Endpoints by Resource

#### Authentication

---

##### POST /auth/login
**Description:** Authenticate cashier and obtain JWT token for system access

**Authentication:** Not Required

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| username | string | Yes | Max 50 chars | Cashier username |
| password | string | Yes | Max 100 chars | Cashier password |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| token | string | JWT authentication token |
| user | object | User profile data |
| expiresIn | integer | Token expiration in seconds |

**Business Rules:**
- User must have active status to login
- Token expires after defined period

---

##### POST /auth/logout
**Description:** Invalidate current session token

**Authentication:** Required

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Logout confirmation |

#### Customers

---

##### GET /customers/search
**Description:** Search for customers using multiple criteria to locate them for transactions

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| customerId | string | No | - | Customer ID filter |
| firstName | string | No | - | First name filter |
| lastName | string | No | - | Last name filter |
| phoneNumber | string | No | - | Phone number filter |
| alternatePhone | string | No | - | Alternate phone filter |
| birthDate | date | No | - | Birth date filter |
| taxId | string | No | - | Tax ID filter |
| street | string | No | - | Street address filter |
| city | string | No | - | City filter |
| postalCode | string | No | - | Postal code filter |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<CustomerSearchResultDTO> | List of matching customers |
| totalResults | integer | Total number of matches |

**Business Rules:**
- At least two search criteria must be provided
- Returns customers with name and address for selection
- If no matches found, returns empty array

---

##### GET /customers/{customerId}
**Description:** Retrieve complete customer profile including associated cards

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | uuid | Yes | Customer identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Customer identifier |
| customerId | string | External customer ID |
| firstName | string | First name |
| lastName | string | Last name |
| birthDate | date | Date of birth |
| taxId | string | Tax identification number |
| email | string | Email address |
| phoneNumber | string | Primary phone number |
| alternatePhone | string | Secondary phone number |
| street | string | Street address |
| city | string | City |
| state | string | State |
| postalCode | string | Postal code |
| hasBafAccount | boolean | BAF account status |
| cards | array<CardDTO> | Associated payment cards |

**Business Rules:**
- Only authenticated cashiers can access customer data
- Card numbers are masked showing only last 4 digits

---

##### PATCH /customers/{customerId}
**Description:** Update customer contact information during transactions

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| customerId | uuid | Yes | Customer identifier |

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| email | string | No | Max 100 chars, Email format | Updated email address |
| phoneNumber | string | No | Max 15 chars | Updated primary phone |
| alternatePhone | string | No | Max 15 chars | Updated secondary phone |
| street | string | No | Max 100 chars | Updated street address |
| city | string | No | Max 50 chars | Updated city |
| state | string | No | Max 50 chars | Updated state |
| postalCode | string | No | Max 10 chars | Updated postal code |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Update confirmation |
| message | string | Success message |
| customer | object | Updated customer data |

**Business Rules:**
- Email and phone number formats must be validated
- Only editable fields can be updated
- Returns success message "Se actualizó el Cliente correctamente"

#### Cards

---

##### GET /cards/{cardNumber}/validate
**Description:** Validate card number format and retrieve associated account information

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cardNumber | string | Yes | 16-digit card number |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| isValid | boolean | Card validation result |
| card | object | Card information |
| account | object | Associated account data |
| promotionalOffers | array<object> | Available promotional offers |

**Business Rules:**
- Card number must be exactly 16 digits
- Only active cards can be validated
- Account numbers masked showing only last 4 digits

---

##### GET /cards/{cardId}/account
**Description:** Retrieve account balance and statement information for card payments

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cardId | uuid | Yes | Card identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| accountNumber | string | Masked account number |
| balance | decimal | Current account balance |
| accountType | string | Account type |
| minimumPayment | decimal | Minimum payment required |
| statementData | object | Account statement information |

**Business Rules:**
- Account numbers are masked showing only last 4 digits
- Balance information used for payment validation

#### Services

---

##### GET /services
**Description:** Retrieve list of available service providers for utility and telecom payments

**Authentication:** Required

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<ServiceDTO> | List of available services |

**Business Rules:**
- Only active services are returned
- Services filtered by branch geographic coverage

---

##### GET /services/{serviceId}/validate-reference
**Description:** Validate service reference number format according to service-specific rules

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serviceId | uuid | Yes | Service provider identifier |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| referenceNumber | string | Yes | - | Reference number to validate |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| isValid | boolean | Reference validation result |
| service | object | Service provider information |
| paymentDetails | object | Payment amount and due date |
| commission | object | Commission calculation |

**Business Rules:**
- Reference format must match service-specific validation pattern
- Returns "Recibo vencido" if payment date has passed
- Commission waived for BAF account holders

#### Service Payments

---

##### POST /service-payments
**Description:** Process utility and telecom service payments with cash denomination tracking

**Authentication:** Required

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| serviceId | uuid | Yes | | Service provider identifier |
| referenceNumber | string | Yes | Max 50 chars | Service reference number |
| paymentAmount | decimal | Yes | Precision 10,2 | Payment amount |
| customerId | uuid | No | | Paying customer (optional) |
| cashDenominations | array<object> | Yes | | Cash received breakdown |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Payment identifier |
| transactionId | uuid | Associated transaction ID |
| status | string | Payment status |
| commissionAmount | decimal | Commission charged |
| receiptId | uuid | Generated receipt ID |

**Business Rules:**
- Reference number must pass service validation
- Expired payments cannot be processed
- Commission automatically calculated and displayed
- Cash denominations must equal payment plus commission

---

##### GET /service-payments/{paymentId}
**Description:** Retrieve service payment details for lookup and confirmation

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| paymentId | uuid | Yes | Payment identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Payment identifier |
| service | object | Service provider details |
| referenceNumber | string | Service reference number |
| paymentAmount | decimal | Payment amount |
| commissionAmount | decimal | Commission charged |
| status | string | Payment status |
| createdAt | datetime | Payment timestamp |

#### Card Payments

---

##### POST /card-payments
**Description:** Process card payments with three-stage cash denomination tracking

**Authentication:** Required

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| cardId | uuid | Yes | | Payment card identifier |
| accountId | uuid | Yes | | Target account identifier |
| paymentAmount | decimal | Yes | Precision 10,2 | Payment amount |
| paymentType | string | Yes | Max 20 chars | Type of payment |
| cashReceived | decimal | Yes | Precision 10,2 | Cash received amount |
| receivedDenominations | array<object> | Yes | | Cash received breakdown |
| paymentDenominations | array<object> | Yes | | Payment denominations |
| changeDenominations | array<object> | No | | Change denominations |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Payment identifier |
| transactionId | uuid | Associated transaction ID |
| changeAmount | decimal | Change returned amount |
| status | string | Payment status |
| receiptId | uuid | Generated receipt ID |

**Business Rules:**
- Payment amount must not exceed account balance
- Minimum payment requirements must be validated
- Cash received must equal payment plus change
- Change denominations validated against drawer inventory

---

##### GET /card-payments/{paymentId}
**Description:** Retrieve card payment details for confirmation and lookup

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| paymentId | uuid | Yes | Payment identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Payment identifier |
| card | object | Payment card details |
| account | object | Target account details |
| paymentAmount | decimal | Payment amount |
| paymentType | string | Payment type |
| cashReceived | decimal | Cash received amount |
| changeAmount | decimal | Change returned amount |
| status | string | Payment status |
| createdAt | datetime | Payment timestamp |

#### Cash Management

---

##### GET /cash-drawer
**Description:** Retrieve current cash drawer inventory by denomination for the authenticated cashier

**Authentication:** Required

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| userId | uuid | Drawer owner identifier |
| denominations | array<CashDenominationDTO> | Current denomination inventory |
| totalAmount | decimal | Total drawer value |
| lastUpdated | datetime | Last update timestamp |

**Business Rules:**
- Each cashier has their own cash drawer inventory
- Real-time inventory tracking for all denominations

---

##### POST /cash-drawer/validate-change
**Description:** Validate if sufficient denominations are available for change calculation

**Authentication:** Required

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| changeAmount | decimal | Yes | Precision 10,2 | Required change amount |
| requestedDenominations | array<object> | Yes | | Requested change breakdown |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| canDispense | boolean | Change availability confirmation |
| insufficientDenominations | array<object> | Denominations lacking inventory |
| suggestedAlternative | array<object> | Alternative denomination breakdown |

**Business Rules:**
- Insufficient denominations marked in red
- Alternative suggestions provided when possible

---

##### PATCH /cash-drawer/update
**Description:** Update cash drawer inventory after transaction completion

**Authentication:** Required

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| transactionId | uuid | Yes | | Associated transaction |
| denominationChanges | array<object> | Yes | | Denomination quantity changes |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Update confirmation |
| updatedInventory | array<object> | Current denomination inventory |

**Business Rules:**
- Inventory updated immediately upon transaction completion
- Maintains audit trail of all changes

#### Transactions

---

##### GET /transactions/{transactionId}
**Description:** Retrieve complete transaction details including cash denominations

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transactionId | uuid | Yes | Transaction identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Transaction identifier |
| transactionType | string | Type of transaction |
| totalAmount | decimal | Total transaction amount |
| status | string | Transaction status |
| customer | object | Customer information |
| cashDenominations | array<object> | Three-stage denomination breakdown |
| createdAt | datetime | Transaction timestamp |
| completedAt | datetime | Completion timestamp |

**Business Rules:**
- Complete audit trail maintained
- Cash denominations shown for all three stages

---

##### POST /transactions/{transactionId}/rollback
**Description:** Rollback failed transaction and reverse cash inventory changes

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| transactionId | uuid | Yes | Transaction identifier |

**Request Body Schema:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| reason | string | Yes | Max 200 chars | Rollback reason |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Rollback confirmation |
| reversedChanges | array<object> | Cash inventory reversals |

**Business Rules:**
- Only failed or pending transactions can be rolled back
- All cash inventory changes are reversed
- Complete audit trail of rollback maintained

#### Receipts

---

##### GET /receipts/{receiptId}
**Description:** Retrieve receipt content for display or reprint

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| receiptId | uuid | Yes | Receipt identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Receipt identifier |
| receiptNumber | string | Receipt number |
| transactionId | uuid | Associated transaction |
| receiptData | object | Complete receipt content |
| originalPrint | boolean | Original vs reprint flag |
| printedAt | datetime | Print timestamp |

**Business Rules:**
- Account numbers masked in receipt data
- Identical content for original and reprints

---

##### POST /receipts/{receiptId}/reprint
**Description:** Generate reprint of existing receipt with identical content

**Authentication:** Required

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| receiptId | uuid | Yes | Receipt identifier |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| reprintId | uuid | New reprint receipt ID |
| originalReceiptId | uuid | Original receipt reference |
| receiptData | object | Complete receipt content |
| printedAt | datetime | Reprint timestamp |

**Business Rules:**
- Reprint maintains identical content to original
- New receipt record created for audit trail
- Original receipt ID referenced in reprint

#### Promotional Offers

---

##### GET /promotional-offers
**Description:** Retrieve available promotional offers for card payment display

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cardType | string | No | - | Filter by card type |
| paymentAmount | decimal | No | - | Filter by minimum amount |

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| data | array<PromotionalOfferDTO> | Available offers |

**Business Rules:**
- Offers filtered by card type and payment amount
- Only active offers within date range returned
- Displayed during card payment process