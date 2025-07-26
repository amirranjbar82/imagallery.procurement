# Technical Requirements Document: Vue + Firebase Procurement System

## 1. Overview

### 1.1 Purpose
A lightweight B2B procurement and vendor management platform that enables businesses to manage suppliers, product catalogs, orders, and associated workflows including invoices, shipments, and payments.

### 1.2 Scope
- Supplier and product catalog management
- Order creation and tracking
- Document management (invoices, shipments, payments)
- Role-based access control
- AI-assisted product catalog ingestion
- Financial reporting and analytics

### 1.3 Technology Stack
- **Frontend**: Vue 3, TypeScript, ShadCN-Vue, Pinia, Vue Router
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **AI Integration**: Google Gemini API for catalog processing
- **Hosting**: Firebase Hosting

---

## 2. Functional Requirements

### 2.1 User Management
- **Authentication**: Email/password and Google OAuth
- **Roles**: Admin, Manager, User, Viewer
- **Access Control**: Users can only access assigned suppliers and products
- **Field Visibility**: Configurable field-level permissions per user

### 2.2 Supplier Management
- **CRUD Operations**: Create, read, update, delete suppliers
- **Required Data**: Company info, contact details, payment terms, communication preferences
- **Status Management**: Active, inactive, pending approval
- **Categorization**: Tags and custom fields for organization

### 2.3 Product Catalog Management
- **Product Groups**: Organize products into catalogs by supplier
- **Product Data**: SKU, pricing, specifications, images, categories, inventory info
- **AI Ingestion**: Upload PDF/Excel catalogs for automatic product extraction
- **Approval Workflow**: Review and approve AI-extracted products before publishing
- **Bulk Operations**: Import/export multiple products

### 2.4 Order Management
- **Order Creation**: Select supplier, add line items with quantities and pricing
- **Order Tracking**: Status progression from draft to completed
- **Approval Workflow**: Multi-level approvals based on order value
- **Line Item Management**: Modify quantities, prices, delivery dates
- **Order History**: Complete audit trail of changes

### 2.5 Document Management
- **Invoice Processing**: Link invoices to orders, track payment status
- **Shipment Tracking**: Record shipment details, track delivery status
- **Payment Records**: Track payments with compliance information
- **File Attachments**: Upload and link documents to orders/invoices/shipments

### 2.6 Reporting
- **SOA Reports**: Statement of Actual costs per shipment
- **Spend Analysis**: Supplier spend breakdown and trends
- **Order Analytics**: Order volume, value, and completion metrics
- **Export Capabilities**: PDF, Excel, CSV formats

---

## 3. Data Model

### 3.1 Core Entities

**Users**
- `uid` - Unique identifier
- `email` - Primary email address
- `name` - Display name
- `role` - Admin, Manager, User, Viewer
- `department` - Optional department assignment
- `accessSuppliers` - Array of accessible supplier IDs
- `accessProducts` - Array of accessible product IDs or 'all'
- `visibleFields` - Array of product/order fields visible to user
- `preferences` - User preferences (currency, date format, timezone, language)
- `isActive` - Account status
- `lastLogin` - Last login timestamp
- `createdAt` - Account creation date
- `updatedAt` - Last profile update

**Suppliers**
- `supplierId` - Unique identifier
- `name` - Company name
- `code` - Unique supplier code
- `contactPerson` - Primary contact name
- `email` - Contact email address
- `phone` - Contact phone number
- `address` - Complete address (street, city, state, country, postal code)
- `paymentTerms` - Payment terms (e.g., "Net 30")
- `currency` - Primary currency
- `taxId` - Tax identification number
- `bankDetails` - Banking information for payments
- `communicationPlatform` - Preferred communication method
- `description` - Supplier description/notes
- `tags` - Array of categorization tags
- `status` - Active, Inactive, Pending
- `rating` - Supplier rating (1-5 stars)
- `totalOrders` - Total number of orders placed
- `totalSpend` - Total amount spent with supplier
- `createdBy` - User who created the record
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Product Groups (Catalogs)**
- `groupId` - Unique identifier
- `supplierId` - Reference to supplier
- `title` - Catalog name
- `description` - Catalog description
- `category` - Main product category
- `subcategory` - Optional subcategory
- `productCount` - Number of products in group
- `sourceDocument` - Original catalog file information
  - `fileName` - Original file name
  - `fileUrl` - Storage location
  - `uploadedAt` - Upload timestamp
  - `extractedBy` - Manual or AI extraction
  - `aiConfidence` - AI extraction confidence score
- `status` - Draft, Active, Archived
- `visibility` - Public or Restricted
- `tags` - Array of tags
- `createdBy` - User who created the group
- `lastModifiedBy` - User who last modified
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Products**
- `productId` - Unique identifier
- `groupId` - Reference to product group
- `supplierId` - Reference to supplier
- `name` - Product name
- `sku` - Supplier SKU
- `internalSku` - Internal company SKU
- `description` - Product description
- `unitPrice` - Base unit price
- `currency` - Price currency
- `minOrderQuantity` - Minimum order quantity
- `priceBreaks` - Volume pricing tiers
- `weight` - Net and gross weight with units
- `dimensions` - Length, width, height with units
- `volume` - Product volume
- `category1` - Primary category
- `category2` - Secondary category
- `category3` - Tertiary category
- `material` - Product material
- `color` - Product color
- `size` - Product size
- `brand` - Brand name
- `model` - Model number
- `specifications` - Additional specifications
- `images` - Array of image URLs
- `primaryImage` - Main product image
- `documents` - Array of document URLs
- `availability` - In-stock, Out-of-stock, Discontinued, Seasonal
- `leadTime` - Lead time in days
- `moq` - Minimum order quantity
- `tags` - Array of searchable tags
- `status` - Active, Inactive, Pending-approval
- `isCustomizable` - Whether product can be customized
- `createdBy` - User who created the product
- `lastModifiedBy` - User who last modified
- `approvedBy` - User who approved the product
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `approvedAt` - Approval timestamp

**Orders**
- `orderId` - Unique identifier
- `orderNumber` - Human-readable order number
- `supplierId` - Reference to supplier
- `orderDate` - Order creation date
- `requestedDeliveryDate` - Requested delivery date
- `status` - Order status (Draft, Pending-approval, Approved, etc.)
- `priority` - Low, Medium, High, Urgent
- `lineItems` - Array of order line items
  - `lineId` - Line item identifier
  - `productId` - Reference to product
  - `productName` - Product name snapshot
  - `sku` - SKU snapshot
  - `quantity` - Ordered quantity
  - `unitPrice` - Unit price
  - `currency` - Price currency
  - `lineTotal` - Line total amount
  - `requestedDeliveryDate` - Line-specific delivery date
  - `status` - Line item status
  - `notes` - Line item notes
- `subtotal` - Order subtotal
- `taxAmount` - Tax amount
- `shippingCost` - Shipping cost
- `totalAmount` - Total order amount
- `currency` - Order currency
- `shippingAddress` - Delivery address
- `billingAddress` - Billing address
- `shippingMethod` - Shipping method
- `trackingNumber` - Shipping tracking number
- `purchaseOrderNumber` - Customer PO reference
- `quotationReference` - Quote reference
- `approvals` - Array of approval records
- `comments` - Array of order comments
- `attachments` - Array of attached files
- `invoiceIds` - Array of linked invoice IDs
- `shipmentIds` - Array of linked shipment IDs
- `paymentIds` - Array of linked payment IDs
- `createdBy` - User who created the order
- `assignedTo` - Assigned account manager
- `lastModifiedBy` - User who last modified
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `completedAt` - Completion timestamp

**Invoices**
- `invoiceId` - Unique identifier
- `invoiceNumber` - Supplier's invoice number
- `orderId` - Reference to order
- `supplierId` - Reference to supplier
- `issueDate` - Invoice issue date
- `dueDate` - Payment due date
- `subtotal` - Invoice subtotal
- `taxAmount` - Tax amount
- `totalAmount` - Total invoice amount
- `currency` - Invoice currency
- `exchangeRate` - Exchange rate if different from order
- `paymentTerms` - Payment terms
- `paymentMethod` - Payment method
- `bankReference` - Bank reference number
- `status` - Received, Verified, Approved, Paid, Disputed
- `lineItems` - Array of invoice line items
- `attachments` - Array of invoice documents
- `verifiedBy` - User who verified the invoice
- `verifiedAt` - Verification timestamp
- `discrepancies` - Array of identified discrepancies
- `createdBy` - User who created the record
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Shipments**
- `shipmentId` - Unique identifier
- `shipmentNumber` - Supplier's shipment number
- `orderId` - Reference to order
- `supplierId` - Reference to supplier
- `shipmentDate` - Shipment date
- `estimatedArrival` - Estimated arrival date
- `actualArrival` - Actual arrival date
- `totalWeight` - Total shipment weight (net, gross, unit)
- `totalVolume` - Total shipment volume
- `packageCount` - Number of packages
- `carrier` - Shipping carrier
- `trackingNumber` - Tracking number
- `shippingMethod` - Shipping method
- `origin` - Origin location (port, city, country)
- `destination` - Destination location
- `forwarder` - Freight forwarder
- `containerNumber` - Container number for sea freight
- `status` - Preparing, Shipped, In-transit, Customs, Delivered, Exception
- `milestones` - Array of shipment milestones
- `packages` - Array of package details
- `attachments` - Array of shipping documents
- `createdBy` - User who created the record
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Payments**
- `paymentId` - Unique identifier
- `orderId` - Reference to order
- `invoiceId` - Reference to invoice
- `supplierId` - Reference to supplier
- `amount` - Payment amount
- `currency` - Payment currency
- `exchangeRate` - Exchange rate used
- `amountInBaseCurrency` - Amount in base currency
- `paymentMethod` - Wire transfer, Check, Credit card, ACH, Other
- `referenceNumber` - Bank reference or check number
- `fromAccount` - Paying account
- `toAccount` - Receiving account
- `bankFees` - Associated bank fees
- `countryOfPayment` - Payment country
- `sourceOfFunds` - Source of funds
- `paymentPurpose` - Purpose of payment
- `complianceNotes` - Compliance notes
- `status` - Pending-approval, Approved, Processing, Completed, Failed, Cancelled
- `paymentDate` - Payment date
- `effectiveDate` - Funds cleared date
- `authorizedBy` - User who authorized payment
- `authorizedAt` - Authorization timestamp
- `attachments` - Array of payment documents
- `createdBy` - User who created the record
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Reports**
- `reportId` - Unique identifier
- `type` - SOA, Spend-analysis, Supplier-performance, Inventory
- `title` - Report title
- `shipmentId` - Reference to shipment (for SOA reports)
- `orderId` - Reference to order
- `data` - Report data structure
  - `summary` - Summary information
  - `details` - Detailed data
  - `charts` - Chart data
  - `metadata` - Report metadata
- `parameters` - Report generation parameters
- `generatedBy` - User who generated the report
- `generatedAt` - Generation timestamp
- `status` - Generating, Completed, Failed
- `error` - Error message if failed
- `exportUrls` - Export file URLs (PDF, Excel, CSV)
- `createdAt` - Creation timestamp

### 3.2 Relationships
- Users → Suppliers (many-to-many via access control)
- Suppliers → Product Groups (one-to-many)
- Product Groups → Products (one-to-many)
- Orders → Suppliers (many-to-one)
- Orders → Products (many-to-many via line items)
- Orders → Invoices/Shipments/Payments (one-to-many)

---

## 4. Technical Architecture

### 4.1 Frontend Architecture
- **Component Structure**: Modular Vue 3 components with Composition API
- **State Management**: Pinia stores for centralized state
- **Routing**: Protected routes with role-based navigation guards
- **UI Framework**: ShadCN-Vue components with Tailwind CSS
- **Form Handling**: Reactive forms with validation
- **Real-time Updates**: Firebase listeners for live data sync

### 4.2 Backend Architecture
- **Database**: Firestore with optimized document structure
- **Authentication**: Firebase Auth with custom claims for roles
- **File Storage**: Firebase Storage with organized folder structure
- **Business Logic**: Cloud Functions for complex operations
- **AI Processing**: Gemini API integration via Cloud Functions

### 4.3 Security Requirements
- **Authentication**: Multi-factor authentication support
- **Authorization**: Firestore security rules based on user roles
- **Data Access**: Field-level and document-level access control
- **File Security**: Signed URLs and access-controlled storage
- **API Security**: Function-level authentication and validation

---

## 5. AI Integration Requirements

### 5.1 Catalog Processing
- **Input Formats**: PDF catalogs, Excel spreadsheets
- **Data Extraction**: Product names, SKUs, prices, specifications, descriptions
- **Image Processing**: Extract and associate product images
- **Quality Assurance**: Confidence scoring and manual review workflow
- **Batch Processing**: Handle large catalogs efficiently

### 5.2 Data Validation
- **Format Standardization**: Convert extracted data to consistent formats
- **Duplicate Detection**: Identify potential duplicate products
- **Price Validation**: Flag unrealistic pricing
- **Completeness Check**: Identify missing required fields

---

## 6. Performance Requirements

### 6.1 Response Times
- **Page Load**: < 2 seconds for initial page load
- **Search**: < 500ms for product/supplier search
- **Data Updates**: < 1 second for CRUD operations
- **File Upload**: Progress indication for files > 5MB

### 6.2 Scalability
- **Users**: Support up to 1,000 concurrent users
- **Data Volume**: Handle 100,000+ products and 10,000+ orders
- **File Storage**: Support for files up to 100MB
- **Search Performance**: Maintain response times with large datasets

### 6.3 Availability
- **Uptime**: 99.9% availability during business hours
- **Backup**: Daily automated backups
- **Recovery**: < 4 hour recovery time objective

---

## 7. Integration Requirements

### 7.1 External APIs
- **Gemini API**: Product catalog processing
- **Firebase Services**: Authentication, database, storage, functions
- **Payment Systems**: Future integration capability
- **Shipping APIs**: Future carrier integration support

### 7.2 Data Import/Export
- **Import Formats**: Excel, CSV for bulk data operations
- **Export Formats**: PDF reports, Excel/CSV data exports
- **API Access**: RESTful API for external system integration

---

## 8. Compliance and Security

### 8.1 Data Protection
- **Privacy**: User data encryption at rest and in transit
- **Access Logging**: Audit trail for all data access and modifications
- **Data Retention**: Configurable retention policies
- **GDPR Compliance**: User data export and deletion capabilities

### 8.2 Financial Compliance
- **Payment Tracking**: Complete audit trail for payments
- **Tax Reporting**: Support for various tax jurisdictions
- **Currency Handling**: Multi-currency support with exchange rates
- **Compliance Reporting**: Generate required financial reports

---

## 9. User Experience Requirements

### 9.1 Interface Design
- **Responsive Design**: Mobile-friendly interface
- **Accessibility**: WCAG 2.1 AA compliance
- **Intuitive Navigation**: Clear information hierarchy
- **Search Functionality**: Global search across all entities

### 9.2 Workflow Support
- **Dashboard**: Overview of key metrics and pending actions
- **Notifications**: In-app notifications for approvals and updates
- **Bulk Operations**: Efficient handling of multiple items
- **Keyboard Shortcuts**: Power user productivity features

---

## 10. Deployment Requirements

### 10.1 Environment Support
- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: High-availability production deployment

### 10.2 Monitoring
- **Application Monitoring**: Performance and error tracking
- **User Analytics**: Usage patterns and feature adoption
- **System Health**: Database performance and storage usage
- **Alert System**: Automated alerts for critical issues

---

## 11. Success Criteria

### 11.1 Business Objectives
- Reduce procurement processing time by 50%
- Improve supplier data accuracy to 95%+
- Enable processing of 10x more catalog data through AI
- Achieve user adoption rate of 80% within 3 months

### 11.2 Technical Objectives
- Pass security audit with no critical findings
- Achieve target performance benchmarks
- Complete AI catalog processing with 90%+ accuracy
- Maintain 99.9% uptime in production

---

## 12. Assumptions and Constraints

### 12.1 Assumptions
- Users have modern web browsers (Chrome, Firefox, Safari, Edge)
- Stable internet connection for real-time features
- Suppliers can provide catalogs in PDF or Excel format
- English language interface (multi-language future enhancement)

### 12.2 Constraints
- Firebase service limitations and pricing tiers
- Gemini API rate limits and costs
- Browser compatibility requirements
- Budget constraints for third-party integrations

### 12.3 Out of Scope (Future Phases)
- Mobile native applications
- Advanced ERP integrations
- Multi-language support
- Advanced workflow automation
- Real-time chat with suppliers