# Event Ticketing and QR Code Check-in System

A full-stack web application for event management, ticket distribution, and secure QR-based check-in.

---

# 1. Motivation

## Problem Statement

Event management is a recurring need across universities, student clubs, conferences, workshops, and private organizations. However, many small-to-medium event organizers still rely on fragmented or inefficient systems for ticket distribution and attendee check-in.

Common practices include:

- Manual spreadsheets for registration tracking  
- Email-based confirmations without structured validation  
- Static QR codes or paper tickets  
- On-site manual name checking  

These approaches create several problems:

- Long check-in queues due to slow verification  
- Duplicate or fraudulent entries when tickets are shared  
- No real-time tracking of attendance or remaining capacity  
- Limited post-event analytics  
- Poor mobile experience during on-site check-in  

Although commercial platforms such as Eventbrite or Ticketmaster exist, they are often too complex or expensive for smaller organizations. As a result, many student clubs and internal events revert to inefficient manual workflows.

There is therefore a clear need for a streamlined, secure, and customizable full-stack event ticketing and QR-based check-in system.

---

## Why This Project is Worth Pursuing

This project is worth pursuing for three main reasons.

### 1. Real-World Practical Impact

A well-designed ticketing and QR check-in platform improves operational efficiency and enhances attendee experience. Automated ticket generation and secure QR validation reduce administrative workload and minimize fraud. Real-time dashboards allow organizers to monitor attendance instantly and manage event capacity effectively.

The system enables:

- Secure QR code generation per attendee  
- Instant ticket validation during check-in  
- Real-time attendance tracking  
- Structured data collection for post-event analysis  

These capabilities transform event management from a manual process into a reliable and scalable digital workflow.

### 2. Strong Alignment with Full-Stack Architecture

An event ticketing system naturally requires integrated frontend interfaces, backend APIs, authentication mechanisms, database design, and real-time updates. It provides an opportunity to implement role-based access control (Organizer, Staff, Attendee), secure data handling, and structured relational storage.

The project is technically meaningful without being overly ambitious. It demonstrates core full-stack competencies while remaining realistic within the course timeline.

### 3. Technical Depth and Scalability

The system introduces non-trivial technical challenges, including:

- Secure QR code generation and validation  
- Preventing duplicate check-ins  
- Real-time synchronization of attendance status  
- Handling ticket tiers, discount codes, and waitlists  
- Ensuring responsive mobile check-in interfaces  

Addressing these challenges requires careful backend logic, database modeling, and state management, making the project educational and technically substantial.

---

## Target Users

The primary target users are:

### 1. Event Organizers

University clubs, student associations, conference coordinators, and community planners who need tools to:

- Create and manage events  
- Configure ticket tiers  
- Track registrations and attendance  
- Monitor real-time check-in data  

### 2. Event Staff

Volunteers or assistants responsible for on-site check-in who require:

- A mobile-friendly interface  
- Fast QR validation  
- Immediate feedback on ticket status  

### 3. Attendees

Students, professionals, and community participants who benefit from:

- Simple online registration  
- Secure QR-based entry  
- A smooth and efficient check-in experience  

By clearly defining these roles, the system ensures appropriate authorization and tailored user experiences.

---

## Existing Solutions and Their Limitations

Commercial platforms such as Eventbrite provide comprehensive services but may involve high fees and limited customization for smaller events.

In contrast, simpler solutions like Google Forms combined with spreadsheets lack secure validation, real-time tracking, and analytics capabilities.

Our system aims to offer a balanced alternative: lightweight, secure, and customizable while maintaining structured data management and real-time functionality.

---

# 2. Objective and Key Features

## 2.1 Project Objectives

The project goal is to develop a safe event ticket and QR code check-in system. The system will support the organizer to create, set up different types and quantities of tickets. Users can register online and receive unique QR code e-tickets; staff can quickly complete the ticket verification through the real-time updated check-in interface. The system ensures the uniqueness and validity of each ticket through identity authentication, database-supported ticket status verification and real-time data synchronization to reduce the workload of manual verification, and effectively avoid problems like duplication or ticket forgery.

## 2.2 Core and Advanced Features
### Technical Implementation Approach

For this project, we will adopt a Next.js based Full-Stack architecture, and we will be implementing both frontend and backend logic in TypeScript. 

For the backend, we will be using Next.js server actions and route handlers to fulfill all functionality which includes user registration and login, event creation, ticket purchasing, QR code generation and validation, and other database operations for our platform. We will implement API routes to handle structured data operations for communication between the frontend and backend.

The frontend will combine Next.js, Tailwind CSS, and shadcn/ui to create a responsive interface that allows users to smoothly use it for event ticketing management without any extra training. The client component will have interactive features for users such as QR code scanning for ticket validation, and the server component will handle data fetching and rendering. This combined structure will provide efficient communication between our server and UI components.

### Database Schema and Relationships

The system architecture is designed around four core entities: User, Event, TicketTier and Ticket. Users can adopt role-based permission control accordingly. The event is created by the Organizer, and each event can have multiple TicketTiers to set the price and amount limits of different tickets for different event arrangements. A ticket contains information such as unique QR codes, check-in status and check-in time records to achieve accurate verification and attendance management. 

The database schema will include the following core entities:
#### 1. User
- id (primary key)
- name
- email (unique)
- passwordHash
- role (Organizer, Staff, Attendee)
- createdAt

#### 2. Event
- id
- title
- description
- dateTime
- location
- organizerId (foreign key → User)
- bannerImageUrl (stored in cloud storage)
- createdAt

Relationship:
- One Organizer can create multiple Events.
- Each Event belongs to one Organizer.

#### 3. TicketTier
- id
- eventId (foreign key → Event)
- name (e.g., General, VIP)
- price
- quantityLimit

Relationship:
- One Event can have multiple Ticket Tiers.

#### 4. Ticket
- id
- userId (foreign key → User)
- eventId (foreign key → Event)
- ticketTierId (foreign key → TicketTier)
- qrCodeToken (unique)
- checkInStatus (boolean)
- checkInTime (timestamp)

Relationship:
- One Attendee can own multiple Tickets.
- Each Ticket is associated with one Event and one TicketTier.

### File Storage

The system will integrate Digital Ocean Spaces as cloud object storage services for resource files related to QR codes. All files uploaded by the front-end will be securely processed through the back-end interface and stored in the cloud. The URL will be recorded in the PostgreSQL database accordingly and associated with the activity or the ticket. The file itself is separated from the structured data as the core business information is stored in a relational database. The current plan of the overall design satisfies the complete collaboration process between front/back-end operations, storage management and database association. 

### User Interface and Experience
The system will provide exclusive dashboards for different roles: Organizers can create events, manage the number of tickets, monitor registration and view attendance analysis data. Participants can register for the event and get QR code-based e-tickets. Staff can quickly verify the QR code through the check-in interface. This clear division of roles improves the ease of use, security and workflow efficiency of the system.

### Advanced Features
To demonstrate meaningful full-stack integration, the system will implement multiple advanced features:

- User authentication: the system distinguishes three roles and restricts functions accordingly to ensure that different identities can only access the corresponding modules.
- QR code generation and validation: each ticket generates a unique QR code and can be verified by the server.
- Real-time check-in dashboard: after scanning the QR code, the database is updated instantly and synchronized to the dashboard in real time without refreshing the page by using WebSocket.
- Automated email confirmations: after successful ticket purchase, a confirmation email will be sent automatically.
- Cloud storage for event assets: Active pictures and files are stored in the cloud to improve the scalability and stability of the system.

## 2.3 Fulfillment of Course Requirements
This project satisfies all core requirements: For the technology stack, we adopts Next.js to create a Full-Stack architecture using Typescript for both frontend and backend. PostgreSQL will be applied for our relational database, and cloudfile storage will be utilized for event related files storage. Tailwind CSS and shadcn/ui will be applied for our responsive UI development.
Five advanced features are designed to cover project requirements on: User Authentication and Authorization, Real-Time Functionality, File Handling and Processing, Integration with External APIs or Services.
This demonstrates that our project combines meaningful full-stack integration, database design, cloud storage usage, and advanced feature implementation in alignment with the course expectations.

## 2.4 Scope and Feasibility
The scope of this project is to develop a web-based event ticketing and managing platform that utilizes a QR code check-in system that integrates user registration, event creation and management, ticket purchasing and validation through QR codes, and a real-time event check-in dashboard. Certain features will be out of the scope, such as the financial payment gateway integration, which will only be simulated.

Regarding feasibility, our development will follow a phased approach in which we will be building initial database schema and backend actions, and routes for event creation and ticket purchasing will be implemented, simultaneously with implementing QR code generation and validation.

---

# 3. Tentative Plan

## Team Responsibilities

We adopt a vertical ownership model with shared review of security- and consistency-critical logic.

Member A – Authentication & Security

- Registration and login

- Session/token management

- Role-based access control (Organizer, Staff, Attendee)

- Protect APIs and Server Actions

- QR token signing and verification

- Security testing

Member B – Event & Ticket Core Logic

- Event management

- TicketTier and quota control

- Ticket issuance and persistence

- Transactional consistency

- Database schema optimization

Member C – Check-in & Real-Time

- Mobile QR scanning interface

- Atomic check-in API

- SSE/WebSocket implementation

- Real-time dashboard and logs

Member D – File Processing, Analytics & Deployment

- Cloud storage integration

- CSV import/export with validation

- Attendance analytics

- Deployment and performance optimization

---

## Development Plan (Milestone-Based)

Core features will be completed within the first 16 days, followed by advanced features and refinement.

Milestone 1 (Days 1–5): Setup and database schema.

Milestone 2 (Days 6–10): Authentication and event management.

Milestone 3 (Days 11–16): Ticketing, signed QR tokens, atomic check-in (core complete).

Milestone 4 (Days 17–20): Real-time dashboard (SSE/WebSocket).

Milestone 5 (Days 21–25): Cloud storage, CSV processing, analytics.

Milestone 6 (Days 26–30): Testing, optimization, documentation, demo.

---

# 4. Initial Independent Reasoning (Before Using AI)

## 4.1 Application Structure and Architecture

Before using AI, we compared a separated frontend-backend architecture (Express) with a Next.js full-stack approach. We selected Next.js full-stack to reduce deployment complexity, simplify API management, and accelerate development within the project timeline. While separated services offer stronger isolation, the added overhead was unnecessary for this scope.

## 4.2 Data and State Design

We divided system state into:

- Durable state (PostgreSQL): users, events, ticket tiers, ticket status, and check-in records.
- Live state: attendance count and recent check-ins, synchronized via SSE or WebSocket.

The most critical consistency point is ticket status transition. To prevent duplicate check-ins, we will use an atomic conditional database update to ensure each ticket can only be used once.

## 4.3 Feature Selection and Scope Decisions

We prioritized authentication with RBAC, secure QR validation, real-time dashboard updates, and CSV-based file processing. To maintain feasibility, payment integration will be simulated, and a responsive web interface will replace a dedicated mobile app.

## 4.4 Anticipated Challenges

Key challenges include secure QR token design, atomic check-in under concurrency, stable real-time updates, and role-based UI separation. Preventing duplicate or fraudulent check-ins is the most technically sensitive area.

## 4.5 Early Collaboration Plan

We adopted vertical feature ownership with shared review of database schema and security-critical logic. Coordination will rely on weekly meetings, pull requests, and joint validation of ticket verification mechanisms.

---

# 5. AI Assistance Disclosure

The project concept, architecture, and feature planning were developed independently through team discussion before using AI.

AI was used only to refine wording and clarify terminology (e.g., distinguishing durable and live state). All system design decisions and scope choices were determined by the team based on feasibility and course requirements.