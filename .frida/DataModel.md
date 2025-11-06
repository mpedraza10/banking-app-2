Looking at the requirements document, I can see it's comprehensive and well-structured. I'll now create the data model that captures ALL the entities, attributes, and relationships needed to satisfy these requirements.

### 1. Entities Overview
- **User**: Represents cashiers and bank staff who operate the system
- **Customer**: Represents bank customers who receive services
- **Card**: Represents payment cards associated with customers
- **Account**: Represents bank accounts linked to cards
- **Service**: Represents service providers (CFE, Telmex, etc.)
- **ServicePayment**: Represents utility/telecom payment transactions
- **CardPayment**: Represents card payment transactions
- **CashDenomination**: Represents cash denomination tracking records
- **Transaction**: Represents completed financial transactions
- **Receipt**: Represents printed transaction receipts
- **CashDrawer**: Represents cashier's cash inventory
- **PromotionalOffer**: Represents promotional offers for card payments
- **GeographicCoverage**: Represents service coverage areas

### 2. Entity Definitions

#### User
**Description:** Represents cashiers and bank staff who operate the Corporate Cash system

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique user identifier |
| username | string | Yes | Max 50 chars, Unique | User login name |
| name | string | Yes | Max 100 chars | Full name |
| role | enum | Yes | Cajero Ventanilla, Cajero Jr, Principal Ventanilla | User role type |
| branchId | string | Yes | Max 20 chars | Branch identifier |
| isActive | boolean | Yes | Default: true | Account status |

**Business Rules:**
- Role-based access control applies to different user types
- Users must have active session for any transaction

---

#### Customer
**Description:** Represents bank customers who receive payment and transaction services

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique customer identifier |
| customerId | string | No | Max 20 chars, Unique | External customer ID |
| firstName | string | Yes | Max 50 chars | First name |
| lastName | string | Yes | Max 50 chars | Last name |
| birthDate | date | No | | Date of birth |
| taxId | string | No | Max 20 chars | Tax identification number |
| email | string | No | Max 100 chars, Email format | Email address |
| phoneNumber | string | No | Max 15 chars | Primary phone |
| alternatePhone | string | No | Max 15 chars | Secondary phone |
| street | string | No | Max 100 chars | Street address |
| city | string | No | Max 50 chars | City |
| state | string | No | Max 50 chars | State |
| postalCode | string | No | Max 10 chars | Postal code |
| hasBafAccount | boolean | Yes | Default: false | BAF account status for commission waiver |

**Business Rules:**
- Customer data can be updated during transactions
- BAF account holders receive commission waivers
- Email and phone formats must be validated on update

---

#### Card
**Description:** Represents payment cards associated with customer accounts

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique card identifier |
| cardNumber | string | Yes | Exactly 16 digits, Unique | Card number |
| customerId | identifier | Yes | Foreign Key → Customer | Card owner |
| accountId | identifier | Yes | Foreign Key → Account | Associated account |
| isActive | boolean | Yes | Default: true | Card status |
| cardType | string | No | Max 20 chars | Type of card |

**Business Rules:**
- Card numbers must be exactly 16 digits
- Card numbers are masked in displays (show only last 4 digits)
- Only active cards can process payments

---

#### Account
**Description:** Represents bank accounts linked to payment cards

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique account identifier |
| accountNumber | string | Yes | Max 20 chars, Unique | Account number |
| balance | decimal | Yes | Precision 10,2 | Current balance |
| accountType | string | Yes | Max 20 chars | Type of account |
| minimumPayment | decimal | No | Precision 10,2 | Minimum payment amount |

**Business Rules:**
- Account numbers are masked in displays (show only last 4 digits)
- Balance validation required for payment processing
- Minimum payment requirements must be enforced

---

#### Service
**Description:** Represents service providers for utility and telecom payments

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique service identifier |
| name | string | Yes | Max 50 chars | Service provider name |
| serviceCode | string | Yes | Max 10 chars, Unique | Service code (CFE, Telmex, etc.) |
| referenceFormat | string | Yes | Max 100 chars | Reference number validation pattern |
| commissionRate | decimal | Yes | Precision 5,4 | Commission percentage |
| fixedCommission | decimal | No | Precision 10,2 | Fixed commission amount |
| creditLimit | decimal | No | Precision 12,2 | Service credit limit |
| dailyLimit | decimal | No | Precision 10,2 | Daily payment limit |
| isActive | boolean | Yes | Default: true | Service availability |

**Business Rules:**
- Reference numbers must match service-specific format validation
- Diestel has fixed credit limit of $100,000 with daily caps $6,000-$8,000
- Commission rates are defined by service provider agreements

---

#### ServicePayment
**Description:** Represents utility and telecom payment transactions

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique payment identifier |
| serviceId | identifier | Yes | Foreign Key → Service | Service provider |
| referenceNumber | string | Yes | Max 50 chars | Service reference number |
| paymentAmount | decimal | Yes | Precision 10,2 | Payment amount |
| commissionAmount | decimal | Yes | Precision 10,2 | Commission charged |
| dueDate | date | No | | Payment due date |
| isExpired | boolean | Yes | Default: false | Expiration status |
| customerId | identifier | No | Foreign Key → Customer | Paying customer |
| userId | identifier | Yes | Foreign Key → User | Processing cashier |
| branchId | string | Yes | Max 20 chars | Processing branch |
| status | enum | Yes | Pending, Completed, Failed | Payment status |
| createdAt | datetime | Yes | | Transaction timestamp |

**Business Rules:**
- Expired payments cannot be processed
- Commission waived for BAF account holders
- Geographic coverage validation required

---

#### CardPayment
**Description:** Represents card payment transactions with detailed cash tracking

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique payment identifier |
| cardId | identifier | Yes | Foreign Key → Card | Payment card |
| accountId | identifier | Yes | Foreign Key → Account | Target account |
| paymentAmount | decimal | Yes | Precision 10,2 | Payment amount |
| paymentType | string | Yes | Max 20 chars | Type of payment |
| cashReceived | decimal | Yes | Precision 10,2 | Cash received amount |
| changeAmount | decimal | Yes | Precision 10,2 | Change returned amount |
| userId | identifier | Yes | Foreign Key → User | Processing cashier |
| branchId | string | Yes | Max 20 chars | Processing branch |
| status | enum | Yes | Pending, Completed, Failed | Payment status |
| createdAt | datetime | Yes | | Transaction timestamp |

**Business Rules:**
- Payment amount must not exceed account balance
- Minimum payment requirements must be validated
- Change calculation must be accurate

---

#### CashDenomination
**Description:** Represents detailed cash denomination tracking for three-stage process

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique denomination record |
| transactionId | identifier | Yes | Foreign Key → Transaction | Associated transaction |
| denominationType | enum | Yes | Received, Payment, Change | Stage of cash flow |
| denomination | decimal | Yes | Precision 10,2 | Denomination value |
| quantity | integer | Yes | Min 0 | Number of bills/coins |
| amount | decimal | Yes | Precision 10,2 | Total amount (calculated) |
| userId | identifier | Yes | Foreign Key → User | Cashier handling |
| createdAt | datetime | Yes | | Entry timestamp |

**Business Rules:**
- Total denominations must match expected amount
- Insufficient denominations marked in red
- Amount = denomination × quantity (calculated field)

---

#### Transaction
**Description:** Represents completed financial transactions with audit trail

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique transaction identifier |
| transactionType | enum | Yes | ServicePayment, CardPayment | Transaction type |
| referenceId | identifier | Yes | | Foreign key to specific payment record |
| totalAmount | decimal | Yes | Precision 10,2 | Total transaction amount |
| status | enum | Yes | Pending, Completed, Failed, Rolled Back | Transaction status |
| userId | identifier | Yes | Foreign Key → User | Processing cashier |
| customerId | identifier | No | Foreign Key → Customer | Customer involved |
| branchId | string | Yes | Max 20 chars | Processing branch |
| externalReferenceId | string | No | Max 50 chars | External system reference |
| createdAt | datetime | Yes | | Transaction timestamp |
| completedAt | datetime | No | | Completion timestamp |

**Business Rules:**
- Complete audit trail maintained for all transactions
- Transaction data persisted immediately upon completion
- Rollback capability for failed operations

---

#### Receipt
**Description:** Represents printed transaction receipts with reprint capability

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique receipt identifier |
| transactionId | identifier | Yes | Foreign Key → Transaction | Associated transaction |
| receiptNumber | string | Yes | Max 20 chars, Unique | Receipt number |
| originalPrint | boolean | Yes | Default: true | Original vs reprint |
| printedAt | datetime | Yes | | Print timestamp |
| userId | identifier | Yes | Foreign Key → User | Printing cashier |
| receiptData | json | Yes | | Complete receipt content |

**Business Rules:**
- Receipts automatically printed on transaction completion
- Account numbers masked in receipts (last 4 digits only)
- Reprint capability maintains identical content

---

#### CashDrawer
**Description:** Represents cashier's cash inventory by denomination

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique drawer record |
| userId | identifier | Yes | Foreign Key → User | Drawer owner |
| denomination | decimal | Yes | Precision 10,2 | Denomination value |
| quantity | integer | Yes | Min 0 | Current quantity |
| amount | decimal | Yes | Precision 10,2 | Total amount (calculated) |
| lastUpdated | datetime | Yes | | Last update timestamp |

**Business Rules:**
- Real-time cash inventory tracking
- Sufficient denominations required for change
- End-of-day reconciliation support

---

#### PromotionalOffer
**Description:** Represents promotional offers displayed during card payments

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique offer identifier |
| title | string | Yes | Max 100 chars | Offer title |
| description | text | Yes | | Offer details |
| cardType | string | No | Max 20 chars | Applicable card type |
| minAmount | decimal | No | Precision 10,2 | Minimum payment amount |
| startDate | date | Yes | | Offer start date |
| endDate | date | Yes | | Offer end date |
| isActive | boolean | Yes | Default: true | Offer status |

**Business Rules:**
- Offers displayed based on card type and payment amount
- Date range validation for active offers

---

#### GeographicCoverage
**Description:** Represents service coverage areas for geographic validation

**Attributes:**
| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| id | identifier | Yes | Primary Key | Unique coverage record |
| serviceId | identifier | Yes | Foreign Key → Service | Service provider |
| state | string | Yes | Max 50 chars | Covered state |
| city | string | No | Max 50 chars | Covered city |
| postalCode | string | No | Max 10 chars | Covered postal code |
| isActive | boolean | Yes | Default: true | Coverage status |

**Business Rules:**
- Service availability validated by branch location
- Coverage rules defined by service providers

---

### 3. Relationships

#### User ↔ ServicePayment
**Type:** One-to-Many

**Description:** Users (cashiers) process multiple service payments. Each service payment is processed by exactly one cashier.

**Cardinality:**
- User: 1..1 (each payment processed by one cashier)
- ServicePayment: 0..* (cashier can process multiple payments)

**Implementation Notes:**
- Foreign key: ServicePayment.userId → User.id

---

#### User ↔ CardPayment
**Type:** One-to-Many

**Description:** Users (cashiers) process multiple card payments. Each card payment is processed by exactly one cashier.

**Cardinality:**
- User: 1..1 (each payment processed by one cashier)
- CardPayment: 0..* (cashier can process multiple payments)

**Implementation Notes:**
- Foreign key: CardPayment.userId → User.id

---

#### User ↔ CashDrawer
**Type:** One-to-Many

**Description:** Each cashier has their own cash drawer with multiple denomination records. Each denomination record belongs to one cashier.

**Cardinality:**
- User: 1..1 (each drawer belongs to one cashier)
- CashDrawer: 0..* (cashier can have multiple denomination records)

**Implementation Notes:**
- Foreign key: CashDrawer.userId → User.id

---

#### Customer ↔ Card
**Type:** One-to-Many

**Description:** Customers can have multiple payment cards. Each card belongs to exactly one customer.

**Cardinality:**
- Customer: 1..1 (each card belongs to one customer)
- Card: 1..* (customer can have multiple cards)

**Implementation Notes:**
- Foreign key: Card.customerId → Customer.id

---

#### Customer ↔ ServicePayment
**Type:** One-to-Many

**Description:** Customers can make multiple service payments. Each service payment may be associated with a customer (optional for anonymous payments).

**Cardinality:**
- Customer: 0..1 (payment may be anonymous)
- ServicePayment: 0..* (customer can make multiple service payments)

**Implementation Notes:**
- Foreign key: ServicePayment.customerId → Customer.id
- Nullable relationship for anonymous payments

---

#### Customer ↔ Transaction
**Type:** One-to-Many

**Description:** Customers can have multiple transactions. Each transaction may be associated with a customer.

**Cardinality:**
- Customer: 0..1 (transaction may be anonymous)
- Transaction: 0..* (customer can have multiple transactions)

**Implementation Notes:**
- Foreign key: Transaction.customerId → Customer.id
- Nullable relationship for anonymous transactions

---

#### Card ↔ Account
**Type:** Many-to-One

**Description:** Multiple cards can be linked to the same account. Each card is associated with exactly one account.

**Cardinality:**
- Card: 1..1 (each card linked to one account)
- Account: 1..* (account can have multiple cards)

**Implementation Notes:**
- Foreign key: Card.accountId → Account.id

---

#### Card ↔ CardPayment
**Type:** One-to-Many

**Description:** Cards can have multiple payments. Each card payment uses exactly one card.

**Cardinality:**
- Card: 1..1 (each payment uses one card)
- CardPayment: 0..* (card can have multiple payments)

**Implementation Notes:**
- Foreign key: CardPayment.cardId → Card.id

---

#### Account ↔ CardPayment
**Type:** One-to-Many

**Description:** Accounts can receive multiple card payments. Each card payment targets exactly one account.

**Cardinality:**
- Account: 1..1 (each payment targets one account)
- CardPayment: 0..* (account can receive multiple payments)

**Implementation Notes:**
- Foreign key: CardPayment.accountId → Account.id

---

#### Service ↔ ServicePayment
**Type:** One-to-Many

**Description:** Services can have multiple payments. Each service payment is for exactly one service provider.

**Cardinality:**
- Service: 1..1 (each payment for one service)
- ServicePayment: 0..* (service can have multiple payments)

**Implementation Notes:**
- Foreign key: ServicePayment.serviceId → Service.id

---

#### Service ↔ GeographicCoverage
**Type:** One-to-Many

**Description:** Services have multiple geographic coverage areas. Each coverage area belongs to one service.

**Cardinality:**
- Service: 1..1 (each coverage area for one service)
- GeographicCoverage: 1..* (service has multiple coverage areas)

**Implementation Notes:**
- Foreign key: GeographicCoverage.serviceId → Service.id

---

#### Transaction ↔ ServicePayment
**Type:** One-to-One

**Description:** Each completed service payment creates exactly one transaction record. Each transaction of type ServicePayment references one service payment.

**Cardinality:**
- Transaction: 1..1 (each service payment creates one transaction)
- ServicePayment: 0..1 (service payment may not complete to transaction)

**Implementation Notes:**
- Foreign key: Transaction.referenceId → ServicePayment.id (when transactionType = ServicePayment)

---

#### Transaction ↔ CardPayment
**Type:** One-to-One

**Description:** Each completed card payment creates exactly one transaction record. Each transaction of type CardPayment references one card payment.

**Cardinality:**
- Transaction: 1..1 (each card payment creates one transaction)
- CardPayment: 0..1 (card payment may not complete to transaction)

**Implementation Notes:**
- Foreign key: Transaction.referenceId → CardPayment.id (when transactionType = CardPayment)

---

#### Transaction ↔ CashDenomination
**Type:** One-to-Many

**Description:** Transactions can have multiple cash denomination records (received, payment, change). Each denomination record belongs to one transaction.

**Cardinality:**
- Transaction: 1..1 (each denomination record for one transaction)
- CashDenomination: 1..* (transaction has multiple denomination records)

**Implementation Notes:**
- Foreign key: CashDenomination.transactionId → Transaction.id

---

#### Transaction ↔ Receipt
**Type:** One-to-Many

**Description:** Transactions can have multiple receipts (original and reprints). Each receipt belongs to one transaction.

**Cardinality:**
- Transaction: 1..1 (each receipt for one transaction)
- Receipt: 1..* (transaction can have multiple receipts)

**Implementation Notes:**
- Foreign key: Receipt.transactionId → Transaction.id

---

### 4. Enumerations and Constants

#### UserRole
**Values:** Cajero Ventanilla, Cajero Jr, Principal Ventanilla
**Used by:** User.role
**Description:** Defines the different types of cashier roles with different access levels

#### PaymentStatus
**Values:** Pending, Completed, Failed
**Used by:** ServicePayment.status, CardPayment.status
**Description:** Tracks the current status of payment processing

#### TransactionStatus
**Values:** Pending, Completed, Failed, Rolled Back
**Used by:** Transaction.status
**Description:** Tracks the overall transaction status including rollback capability

#### TransactionType
**Values:** ServicePayment, CardPayment
**Used by:** Transaction.transactionType
**Description:** Identifies the type of transaction for proper reference linking

#### DenominationType
**Values:** Received, Payment, Change
**Used by:** CashDenomination.denominationType
**Description:** Identifies which stage of the three-stage cash flow this denomination record represents

#### StandardDenominations
**Values:** 0.50, 1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00, 200.00, 500.00, 1000.00
**Used by:** CashDenomination.denomination, CashDrawer.denomination
**Description:** Standard Mexican peso denominations for cash handling