# Technical Requirements Document: Vue + Firebase Business Management System (ERP)

## 1. Overview

### 1.1 Purpose
A comprehensive business management platform (ERP) that enables organizations to manage their operations across multiple departments and business functions. The system provides integrated modules for organizational management, procurement, task management, inventory, sales, and more.

### 1.2 Scope
- **Organization Management**: Department hierarchy, multi-department user assignments
- **User Management**: Role-based access control across departments and modules
- **Procurement Module**: Supplier management, product catalogs, orders, invoices, payments
- **Task & Project Management**: Task tracking, project management, team collaboration
- **Inventory Management**: Stock tracking, warehouse management, item movements
- **Sales Management**: Customer management, sales orders, quotations, CRM features
- **Document Management**: Centralized document storage and workflow
- **Reporting & Analytics**: Cross-module reporting and business intelligence
- **AI Integration**: Automated data processing and intelligent insights

### 1.3 Technology Stack
- **Frontend**: Vue 3, TypeScript, ShadCN-Vue, Pinia, Vue Router
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **AI Integration**: Google Gemini API for catalog processing
- **Hosting**: Firebase Hosting

---

## 2. Functional Requirements

### 2.1 Organization Management
- **Company Structure**: Hierarchical department organization
- **Department Creation**: Create departments with parent-child relationships
- **Department Hierarchy**: Support for multi-level organizational structure
- **Department Permissions**: Module access and permissions at department level
- **Cross-Department Visibility**: Configure inter-department data sharing
- **Budget Management**: Department-level budget allocation and tracking

### 2.2 User Management
- **Authentication**: Email/password and Google OAuth
- **Roles**: Super Admin, Admin, Manager, User, Viewer
- **Multi-Department Assignment**: Users can belong to multiple departments
- **Primary Department**: Designate primary department for default permissions
- **Role per Department**: Different roles in different departments
- **Access Control**: Users access data based on department assignments and roles
- **Field Visibility**: Configurable field-level permissions per user and department
- **User Delegation**: Temporary access delegation and coverage assignments

### 2.3 Procurement Module

#### 2.3.1 Supplier Management
- **CRUD Operations**: Create, read, update, delete suppliers
- **Required Data**: Company info, contact details, payment terms, communication preferences
- **Status Management**: Active, inactive, pending approval
- **Categorization**: Tags and custom fields for organization
- **Document Management**: Store and manage supplier-specific documents like catalogs, certifications, and agreements
- **Supplier Performance**: Rating, delivery tracking, quality metrics

#### 2.3.2 Product Catalog Management
- **Product Groups**: Organize products into catalogs by supplier
- **Product Data**: SKU, pricing, specifications, images, categories, inventory info
- **AI Ingestion**: Upload PDF/Excel catalogs for automatic product extraction
- **Approval Workflow**: Review and approve AI-extracted products before publishing
- **Bulk Operations**: Import/export multiple products
- **Price Management**: Historical pricing, price breaks, currency handling

#### 2.3.3 Purchase Order Management
- **Order Creation**: Select supplier, add line items with quantities and pricing
- **Order Tracking**: Status progression from draft to completed
- **Approval Workflow**: Multi-level approvals based on order value and department
- **Line Item Management**: Modify quantities, prices, delivery dates
- **Order History**: Complete audit trail of changes
- **Integration**: Link to inventory and payment modules

#### 2.3.4 Invoice & Payment Processing
- **Invoice Processing**: Link invoices to orders, track payment status
- **Shipment Tracking**: Record shipment details, track delivery status
- **Payment Records**: Track payments with compliance information
- **File Attachments**: Upload and link documents to orders/invoices/shipments
- **Three-Way Matching**: PO, Receipt, Invoice reconciliation

#### 2.3.5 Procurement Reporting
- **SOA Reports**: Statement of Actual costs per shipment
- **Spend Analysis**: Supplier spend breakdown and trends
- **Order Analytics**: Order volume, value, and completion metrics
- **Compliance Reports**: Audit trails and regulatory reports
- **Export Capabilities**: PDF, Excel, CSV formats

### 2.4 Task & Project Management Module

#### 2.4.1 Task Management
- **Task Creation**: Create, assign, and track individual tasks
- **Task Hierarchies**: Parent-child task relationships and subtasks
- **Status Tracking**: To-do, In Progress, Review, Completed, Cancelled
- **Priority Management**: High, Medium, Low priority assignments
- **Due Date Management**: Deadline tracking and notifications
- **Assignment & Ownership**: Multi-user task assignment and responsibility

#### 2.4.2 Project Management
- **Project Creation**: Define projects with scope, timeline, and resources
- **Project Templates**: Reusable project structures and workflows
- **Gantt Charts**: Visual project timeline and dependency management
- **Resource Allocation**: Assign team members and track utilization
- **Milestone Tracking**: Key deliverable and checkpoint management
- **Project Reporting**: Progress, resource utilization, and completion metrics

#### 2.4.3 Team Collaboration
- **Comments & Updates**: Task and project communication threads
- **File Sharing**: Attach documents and files to tasks/projects
- **Time Tracking**: Log time spent on tasks and projects
- **Notifications**: Real-time updates and deadline reminders
- **Activity Feeds**: Team activity and progress visibility

### 2.5 Inventory Management Module

#### 2.5.1 Stock Management
- **Item Master**: Maintain inventory items with specifications and attributes
- **Stock Levels**: Real-time stock quantities and availability
- **Multi-Location**: Support for multiple warehouses and storage locations
- **Stock Movements**: Track all inventory transactions (in, out, transfers)
- **Reorder Management**: Automatic reorder points and purchase suggestions
- **Batch/Serial Tracking**: Track items by batch numbers or serial numbers

#### 2.5.2 Warehouse Management
- **Location Management**: Define warehouse zones, aisles, and storage bins
- **Receiving**: Process incoming shipments and update inventory
- **Picking & Packing**: Optimize picking routes and packing processes
- **Cycle Counting**: Regular inventory audits and discrepancy management
- **Inventory Adjustments**: Manual stock adjustments with approval workflows

#### 2.5.3 Inventory Reporting
- **Stock Reports**: Current stock levels, aging, and turnover analysis
- **Movement Reports**: Detailed transaction histories and trends
- **Valuation Reports**: Inventory valuation using various costing methods
- **ABC Analysis**: Categorize items by importance and value

### 2.6 Sales Management Module

#### 2.6.1 Customer Management (CRM)
- **Customer Profiles**: Comprehensive customer information and history
- **Contact Management**: Multiple contacts per customer organization
- **Customer Hierarchy**: Parent-child customer relationships
- **Credit Management**: Credit limits, terms, and payment history
- **Customer Communications**: Email, phone, and meeting tracking

#### 2.6.2 Sales Order Management
- **Quotation Management**: Create and track customer quotations
- **Sales Order Processing**: Convert quotes to orders with approval workflows
- **Order Fulfillment**: Integration with inventory for order completion
- **Delivery Management**: Schedule and track customer deliveries
- **Sales Returns**: Process returns and credits

#### 2.6.3 Sales Analytics
- **Sales Reporting**: Revenue, margins, and performance metrics
- **Customer Analytics**: Customer profitability and behavior analysis
- **Sales Forecasting**: Predictive analytics for sales planning
- **Territory Management**: Sales territory and representative performance

### 2.7 Document Management System
- **Centralized Storage**: Single repository for all business documents
- **Document Categories**: Organize by type, department, or project
- **Version Control**: Track document versions and revision history
- **Access Control**: Role-based document access and permissions
- **Search & Indexing**: Full-text search across all documents
- **Workflow Integration**: Link documents to business processes
- **Digital Signatures**: Electronic signature capabilities

### 2.8 Reporting & Analytics
- **Cross-Module Reporting**: Integrated reports across all business functions
- **Dashboard Creation**: Customizable dashboards for different roles
- **Key Performance Indicators**: Track business metrics and KPIs
- **Data Export**: Multiple export formats (PDF, Excel, CSV, JSON)
- **Scheduled Reports**: Automated report generation and distribution
- **Advanced Analytics**: Trend analysis and predictive insights

---

## 3. Data Model

### 3.1 Core Entities

**Departments**
- `departmentId` - Unique identifier
- `name` - Department name
- `code` - Department code/abbreviation
- `description` - Department description
- `parentDepartmentId` - Parent department (for hierarchy)
- `level` - Hierarchy level (0 = root)
- `path` - Full hierarchy path
- `manager` - Department manager user ID
- `budget` - Department budget allocation
- `costCenter` - Cost center code
- `location` - Physical location
- `moduleAccess` - Array of accessible modules
- `permissions` - Department-level permissions
- `isActive` - Department status
- `createdBy` - User who created the department
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Users**
- `uid` - Unique identifier
- `email` - Primary email address
- `name` - Display name
- `globalRole` - Super Admin, Admin, Manager, User, Viewer
- `primaryDepartmentId` - Primary department assignment
- `departmentAssignments` - Array of department assignments
  - `departmentId` - Department ID
  - `role` - Role in this department
  - `permissions` - Department-specific permissions
  - `assignedDate` - Assignment date
  - `isActive` - Assignment status
- `accessSuppliers` - Array of accessible supplier IDs
- `accessProducts` - Array of accessible product IDs or 'all'
- `visibleFields` - Array of product/order fields visible to user
- `preferences` - User preferences (currency, date format, timezone, language)
- `delegations` - Array of active delegations
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

**SupplierDocuments**
- `documentId` - Unique identifier
- `supplierId` - Foreign key to the supplier
- `fileName` - Original name of the file
- `storagePath` - Path to the file in Firebase Storage
- `fileType` - Mime type or extension
- `fileSize` - Size in bytes
- `description` - Optional description of the document
- `uploadedBy` - UID of the user who uploaded the file
- `createdAt` - Upload timestamp

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

**Tasks**
- `taskId` - Unique identifier
- `title` - Task title
- `description` - Task description
- `projectId` - Reference to parent project (optional)
- `parentTaskId` - Reference to parent task (for subtasks)
- `assignedTo` - Array of assigned user IDs
- `assignedBy` - User who assigned the task
- `departmentId` - Department assignment
- `status` - To-do, In Progress, Review, Completed, Cancelled
- `priority` - High, Medium, Low
- `dueDate` - Task due date
- `estimatedHours` - Estimated time to complete
- `actualHours` - Actual time spent
- `tags` - Array of task tags
- `attachments` - Array of file attachments
- `comments` - Array of task comments
- `checklist` - Array of subtask items
- `dependencies` - Array of dependent task IDs
- `completedAt` - Completion timestamp
- `createdBy` - User who created the task
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Projects**
- `projectId` - Unique identifier
- `name` - Project name
- `description` - Project description
- `departmentId` - Owning department
- `projectManager` - Project manager user ID
- `teamMembers` - Array of team member user IDs
- `status` - Planning, Active, On-hold, Completed, Cancelled
- `priority` - High, Medium, Low
- `startDate` - Project start date
- `endDate` - Project end date
- `budget` - Project budget allocation
- `actualCost` - Actual project cost
- `progress` - Completion percentage
- `milestones` - Array of project milestones
- `tags` - Array of project tags
- `attachments` - Array of project documents
- `templateId` - Reference to project template (if used)
- `createdBy` - User who created the project
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**InventoryItems**
- `itemId` - Unique identifier
- `sku` - Stock keeping unit
- `name` - Item name
- `description` - Item description
- `category` - Item category
- `subcategory` - Item subcategory
- `brand` - Brand name
- `model` - Model number
- `specifications` - Technical specifications
- `unitOfMeasure` - Base unit (each, kg, liter, etc.)
- `costPrice` - Average cost price
- `sellPrice` - Standard selling price
- `currency` - Price currency
- `supplierId` - Primary supplier reference
- `alternateSuppliers` - Array of alternate supplier IDs
- `reorderPoint` - Minimum stock level
- `reorderQuantity` - Standard reorder quantity
- `leadTime` - Supplier lead time in days
- `serialTracked` - Whether item requires serial tracking
- `batchTracked` - Whether item requires batch tracking
- `status` - Active, Inactive, Discontinued
- `images` - Array of item images
- `documents` - Array of item documents
- `createdBy` - User who created the item
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**StockLevels**
- `stockId` - Unique identifier
- `itemId` - Reference to inventory item
- `locationId` - Warehouse/location reference
- `quantityOnHand` - Current stock quantity
- `quantityReserved` - Reserved quantity (allocated to orders)
- `quantityAvailable` - Available quantity (on hand - reserved)
- `quantityOnOrder` - Quantity on purchase orders
- `lastStockTake` - Last physical count date
- `lastMovementDate` - Last stock movement date
- `averageCost` - Weighted average cost
- `totalValue` - Total stock value
- `updatedAt` - Last update timestamp

**StockMovements**
- `movementId` - Unique identifier
- `itemId` - Reference to inventory item
- `locationId` - Warehouse/location reference
- `movementType` - Receipt, Issue, Transfer, Adjustment, Count
- `referenceType` - PO, SO, Transfer, Adjustment
- `referenceId` - Reference document ID
- `quantity` - Movement quantity (positive or negative)
- `unitCost` - Cost per unit
- `totalCost` - Total movement cost
- `batchNumber` - Batch number (if applicable)
- `serialNumbers` - Array of serial numbers (if applicable)
- `reason` - Movement reason/description
- `processedBy` - User who processed the movement
- `processedAt` - Movement timestamp
- `createdAt` - Creation timestamp

**Customers**
- `customerId` - Unique identifier
- `customerNumber` - Customer reference number
- `name` - Customer/company name
- `type` - Individual, Company, Government
- `parentCustomerId` - Parent customer (for subsidiaries)
- `contacts` - Array of customer contacts
  - `contactId` - Contact identifier
  - `name` - Contact name
  - `title` - Job title
  - `email` - Email address
  - `phone` - Phone number
  - `isPrimary` - Primary contact flag
- `addresses` - Array of customer addresses
  - `addressId` - Address identifier
  - `type` - Billing, Shipping, Both
  - `street` - Street address
  - `city` - City
  - `state` - State/province
  - `postalCode` - Postal code
  - `country` - Country
  - `isPrimary` - Primary address flag
- `paymentTerms` - Payment terms (e.g., "Net 30")
- `creditLimit` - Credit limit amount
- `currency` - Primary currency
- `taxId` - Tax identification number
- `industry` - Industry category
- `website` - Company website
- `notes` - Customer notes
- `status` - Active, Inactive, Prospect, Blocked
- `rating` - Customer rating (1-5 stars)
- `totalSales` - Total sales amount
- `totalOrders` - Total number of orders
- `lastOrderDate` - Last order date
- `assignedSalesRep` - Assigned sales representative
- `createdBy` - User who created the record
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**SalesOrders**
- `salesOrderId` - Unique identifier
- `orderNumber` - Sales order number
- `customerId` - Reference to customer
- `contactId` - Customer contact reference
- `orderDate` - Order date
- `requestedDeliveryDate` - Requested delivery date
- `promisedDeliveryDate` - Promised delivery date
- `status` - Draft, Confirmed, In-production, Shipped, Delivered, Cancelled
- `priority` - Low, Medium, High, Urgent
- `salesRep` - Assigned sales representative
- `lineItems` - Array of order line items
  - `lineId` - Line item identifier
  - `itemId` - Reference to inventory item
  - `itemName` - Item name snapshot
  - `sku` - SKU snapshot
  - `quantity` - Ordered quantity
  - `unitPrice` - Unit selling price
  - `discount` - Line discount percentage
  - `lineTotal` - Line total amount
  - `deliveryDate` - Line-specific delivery date
  - `status` - Line item status
- `subtotal` - Order subtotal
- `discountAmount` - Total discount amount
- `taxAmount` - Tax amount
- `shippingCost` - Shipping cost
- `totalAmount` - Total order amount
- `currency` - Order currency
- `shippingAddress` - Delivery address
- `billingAddress` - Billing address
- `shippingMethod` - Shipping method
- `trackingNumber` - Shipping tracking number
- `customerPO` - Customer purchase order reference
- `quotationId` - Reference to source quotation
- `terms` - Order terms and conditions
- `comments` - Array of order comments
- `attachments` - Array of attached files
- `invoiceIds` - Array of linked invoice IDs
- `shipmentIds` - Array of linked shipment IDs
- `createdBy` - User who created the order
- `assignedTo` - Assigned order processor
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `completedAt` - Completion timestamp

**Reports**
- `reportId` - Unique identifier
- `type` - SOA, Spend-analysis, Supplier-performance, Inventory, Sales, Tasks
- `title` - Report title
- `moduleType` - Source module (Procurement, Sales, Inventory, Tasks)
- `referenceId` - Reference to source document
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

#### Organization & User Management
- Departments → Departments (one-to-many, hierarchical)
- Departments → Users (one-to-many via department assignments)
- Users → Departments (many-to-many via department assignments)
- Users → Tasks (many-to-many via assignments)
- Users → Projects (many-to-many via team membership)

#### Procurement Module
- Users → Suppliers (many-to-many via access control)
- Suppliers → Product Groups (one-to-many)
- Product Groups → Products (one-to-many)
- Orders → Suppliers (many-to-one)
- Orders → Products (many-to-many via line items)
- Orders → Invoices/Shipments/Payments (one-to-many)
- Suppliers → SupplierDocuments (one-to-many)

#### Task & Project Management
- Projects → Tasks (one-to-many)
- Tasks → Tasks (one-to-many, parent-child hierarchy)
- Projects → Departments (many-to-one)
- Tasks → Departments (many-to-one)
- Users → Projects (many-to-many as project managers/team members)

#### Inventory Management
- InventoryItems → Suppliers (many-to-one for primary supplier)
- InventoryItems → StockLevels (one-to-many by location)
- InventoryItems → StockMovements (one-to-many)
- StockMovements → Orders (many-to-one for receipts)
- StockMovements → SalesOrders (many-to-one for issues)

#### Sales Management
- Customers → SalesOrders (one-to-many)
- SalesOrders → InventoryItems (many-to-many via line items)
- SalesOrders → Users (many-to-one for sales rep assignment)
- Customers → Users (many-to-one for sales rep assignment)

#### Cross-Module Integration
- Orders → InventoryItems (many-to-many via products)
- SalesOrders → StockMovements (one-to-many for inventory issues)
- Projects → Orders (one-to-many for project-specific procurement)
- Tasks → All Modules (many-to-many via attachments and references)
- Reports → All Modules (many-to-one based on report type)

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