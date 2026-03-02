# Event Ticketing and QR Code Check-in System

A full-stack web application for event management, ticket distribution, and secure QR-based check-in.

---

# 1. Motivation

## Problem Statement

Event management is a recurring need across universities, student clubs, conferences, workshops, and private organizations. However, many small-to-medium event organizers still rely on fragmented or inefficient systems for ticket distribution and attendee check-in.

Common practices include:

- Manual spreadsheets for registration tracking  
- Email-based ticket confirmations  
- Paper tickets or static QR codes without validation logic  
- On-site manual name checking during check-in  

These approaches lead to several problems:

- Long check-in queues due to manual verification  
- Duplicate or fraudulent entries when tickets are shared or screenshots are reused  
- Lack of real-time attendance tracking, making it difficult for organizers to monitor event capacity  
- Limited analytics, preventing organizers from learning from past events  
- Poor user experience, especially on mobile devices  

While commercial platforms such as Eventbrite or Ticketmaster exist, they are often too complex, expensive, or feature-heavy for smaller organizations. Many student clubs and internal university events require a lightweight, customizable solution that fits their specific workflows.

Therefore, there is a clear need for a streamlined, modern, and technically robust full-stack event ticketing and QR-based check-in system.

---

## Why This Project is Worth Pursuing

This project is worth pursuing for three main reasons.

### 1. Real-World Practical Impact

A well-designed ticketing and QR check-in platform directly improves operational efficiency for event organizers and enhances the experience for attendees. Real-time validation reduces fraud and congestion, while automated workflows minimize administrative burden.

The system can:

- Automate ticket generation and email confirmations  
- Generate unique, secure QR codes per attendee  
- Validate tickets instantly during check-in  
- Provide real-time dashboards for attendance tracking  
- Offer post-event analytics for decision-making  

These capabilities transform event management from a manual process into a scalable digital workflow.

### 2. Strong Alignment with Full-Stack Architecture

An event ticketing system naturally requires a complete full-stack architecture:

- Frontend: Registration forms, ticket dashboard, mobile check-in interface  
- Backend: RESTful APIs, authentication, QR validation logic  
- Database: Transaction data, user roles, attendance records  
- File handling: Event assets (images, logos), QR code generation  
- Real-time updates: Live attendance dashboard  

This makes it an ideal project for demonstrating mastery of modern web technologies including:

- TypeScript (frontend and backend)  
- React or Next.js  
- Express or Next.js API routes  
- PostgreSQL  
- Authentication systems  
- Real-time communication  
- Cloud storage integration  

The project is neither trivial nor overly ambitious — it is well-scoped and realistic within the course timeline.

### 3. Technical Depth and Scalability

This system introduces non-trivial technical challenges such as:

- Secure QR code generation and validation  
- Preventing duplicate check-ins  
- Role-based access control (Organizer, Staff, Attendee)  
- Real-time synchronization of check-in status  
- Handling ticket tiers, discount codes, and waitlists  
- Ensuring mobile responsiveness for on-site scanning  

These features require careful backend design, state management, and database modeling, making the project technically meaningful and educational.

---

## Target Users

The primary target users are:

### 1. Event Organizers

- University clubs  
- Student associations  
- Workshop and hackathon hosts  
- Small conference coordinators  
- Community event planners  

Organizers need tools to create events, configure ticket tiers, monitor registrations, and analyze attendance efficiently.

### 2. Event Staff

- Volunteers responsible for on-site check-in  
- Administrative assistants  

Staff require a fast, mobile-friendly interface to scan QR codes and validate tickets in real time.

### 3. Attendees

- Students  
- Professionals  
- Community participants  

Attendees benefit from:

- Easy online registration  
- Secure QR-based entry  
- Clear confirmation emails  
- Smooth and fast check-in experience  

By clearly separating these user roles, the system ensures proper authorization and tailored user experiences.

---

## Existing Solutions and Their Limitations

Existing platforms like Eventbrite and Ticketmaster offer comprehensive solutions but may not be ideal for smaller-scale events due to:

- High service fees  
- Limited customization for niche workflows  
- Overly complex interfaces  
- Vendor lock-in  
- Restricted data access  

Additionally, many small organizations resort to Google Forms combined with spreadsheets, which lack:

- Secure ticket validation  
- Real-time check-in tracking  
- Automated QR generation  
- Attendance analytics  

Our system aims to provide a balanced alternative: technically robust yet lightweight and customizable.

---

# 2. Objective and Key Features

## 2.1 Project Objectives

The project goal of the team is to develop a safe and scalable event ticket and QR code check-in system to optimize the whole process from ticket creation to on-site verification. The system will support the organizer to create, set up different types and quantities of tickets. Users can register online and receive unique QR code e-tickets; staff can quickly complete the ticket verification through the real-time updated check-in interface. The system ensures the uniqueness and validity of each ticket through identity authentication, database-supported ticket status verification and real-time data synchronization to reduce the workload of manual verification, and effectively avoid problems like duplication or ticket forgery. For example, in a campus activity, the staff only needs to scan the QR code, and the system can immediately show if the ticket is valid or has been used.

## 2.2 Core and Advanced Features
### Technical Implementation Approach

For this project, we will adopt a Next.js based Full-Stack architecture, and we will be implementing both frontend and backend logic in TypeScript. 
For the backend, we will be using Next.js server actions and route handlers to fulfill all functionality which includes user registration and login, event creation, ticket purchasing, QR code generation and validation, and other database operations for our platform. The frontend will combine Next.js, Tailwind CSS, and shadcn/ui to create a responsive interface that allows users to smoothly use it for event ticketing management without any extra training. The client component will have interactive features for users such as QR code scanning for ticket validation, and the server component will handle data fetching and rendering. This combined structure will provide efficient communication between our server and UI components.


### Database Schema and Relationships

This team plans to design the system architecture around four core entities: User, Event, TicketTier and Ticket. Users can adopt role-based permission control accordingly, including Organizer, Staff and Attendee, to ensure that different identities can only access the functions they are responsible for. The event is created by the Organizer, and each event can have multiple TicketTiers to set the price and amount limits of different tickets for different event arrangements. A ticket is used to link participants with their specific activities, which contains information such as unique QR codes, check-in status and check-in time records to achieve accurate verification and attendance management. The architecture establishes a clear association to ensure data consistency, prevent duplicate ticketing or admission, and support real-time attendance statistics. The overall database structure adopts a standardized design, account scalability and system stability.


### File Storage

The system will integrate cloud object storage services to store resource files related to QR codes. All files uploaded by the front-end will be securely processed through the back-end interface and stored in the cloud. The URL will be recorded in the PostgreSQL database accordingly and associated with the activity or the ticket. The file itself is separated from the structured data as the core business information is stored in a relational database. The current plan of the overall design satisfies the complete collaboration process between front/back-end operations, storage management and database association. 

### User Interface and Experience
The system will provide exclusive dashboards for different roles: Organizers can create events, manage the number of tickets, monitor registration and view attendance analysis data. Participants can register for the event and get QR code-based e-tickets. Staff can quickly verify the QR code through the check-in interface. This clear division of roles improves the ease of use, security and workflow efficiency of the system.

### Advanced Features
To demonstrate meaningful full-stack integration, the system will implement multiple advanced features:

- User authentication: the system distinguishes three roles and restricts functions accordingly to ensure that different identities can only access the corresponding modules.
- QR code generation and validation: each ticket generates a unique QR code and can be verified by the server.
- Real-time check-in dashboard: after scanning the QR code, the database is updated instantly and synchronized to the dashboard in real time without refreshing the page.
- Automated email confirmations: after successful ticket purchase, a confirmation email will be sent automatically.
- Cloud storage for event assets: Active pictures and files are stored in the cloud to improve the scalability and stability of the system.

## 2.3 Fulfillment of Course Requirements
This project satisfies all mandatory core requirements: For the technology stack, we adopts Next.js to create a Full-Stack architecture using Typescript for both frontend and backend. PostgreSQL will be applied for our relational database, and cloudfile storage will be utilized for event related files storage.Tailwind CSS and shadcn/ui will be applied for our responsive UI development.
Regarding advanced features, five of them are planned that cover project requirements on dimensions such: User Authentication and Authorization:Real-Time Functionality,File Handling and Processing:,Integration with External APIs or Services.
This demonstrates that our project combines meaningful full-stack integration, database design, cloud storage usage, and advanced feature implementation in alignment with the course expectations.

## 2.4 Scope and Feasibility
The scope of this project is to develop a web-based event ticketing and managing platform that utilizes a QR code check-in system that integrates user registration, event creation and management, ticket purchasing and validation through QR codes, and a real-time event check-in dashboard. Certain features will be out of the scope, such as the financial payment gateway integration, which will only be simulated. A Mobile application is not included in our development timeline.

Regarding feasibility, our development will follow a phased approach in which we will be building initial database schema and backend actions, and routes for event creation and ticket purchasing will be implemented, simultaneously with implementing QR code generation and validation. Lastly, a real-time check-in dashboard will be implemented, followed by final testing and refinement.

---

# 3. Tentative Plan

## Team Responsibilities

We will adopt a vertical ownership model with cross-review on critical logic, meaning each member is responsible for a core feature area while collaborating on security-sensitive and consistency-critical components.

Member A – Authentication & Security

1. Implement user registration and login

2. Manage session or token-based authentication

3. Implement role-based access control (Organizer, Staff, Attendee)

4. Protect Server Actions and APIs

5. Design and implement QR token signing and verification

6. Conduct security testing and edge-case handling

Member B – Event & Ticket Core Logic

1. Implement event creation and management

2. Implement TicketTier configuration and quota control

3. Implement ticket issuance and database persistence

4. Ensure transactional consistency for ticket generation

5. Optimize database schema and relationships

Member C – Check-in System & Real-Time Communication

1. Implement mobile-friendly QR scanning interface

2. Develop atomic check-in API to prevent duplicate usage

3. Implement SSE or WebSocket for real-time updates

4. Build real-time attendance dashboard

5. Implement check-in log tracking and display

Member D – File Processing, Analytics & Deployment

1. Integrate cloud storage for event assets and reports

2. Implement CSV import/export with validation and error reporting

3. Build attendance analytics dashboard (e.g., attendance rate, ticket usage distribution)

4. Manage deployment and environment configuration

5. Conduct performance optimization and system testing

---

## Weekly Plan

Week 1 – Architecture & Setup

- Finalize database ER design

- Initialize Next.js full-stack project with TypeScript

- Configure PostgreSQL

- Set up project structure and role-based navigation

- Define API and data flow structure

Week 2 – Authentication & Core Event Features

- Implement registration and login

- Implement RBAC and protected routes

- Complete basic Event CRUD functionality

- Build initial Organizer dashboard structure

Week 3 – Ticketing & QR Generation

- Implement TicketTier management

- Implement ticket issuance logic

- Design and implement signed QR token mechanism

- Test ticket state transitions and validation logic

Week 4 – Check-in System

- Implement QR scanning interface

- Develop atomic check-in API (prevent duplicate check-ins)

- Implement check-in logging and validation responses

- Conduct concurrency testing

Week 5 – Real-Time Dashboard & File Processing

- Implement SSE or WebSocket for live updates

- Complete real-time attendance dashboard

- Implement CSV import/export with validation

- Integrate cloud storage for event assets and reports

Week 6 – Optimization & Finalization

- Perform concurrency and security testing

- Optimize mobile responsiveness

- Conduct performance tuning

- Finalize README.md and ai-session.md

- Record demo video and prepare presentation

---

# 4. Initial Independent Reasoning (Before Using AI)

## 4.1 Application Structure and Architecture
Before consulting any AI tools, our team discussed two architectural options: a separated frontend-backend architecture using Express, and a Next.js full-stack approach using App Router and Server Actions.

We ultimately selected a Next.js full-stack architecture for the following reasons:

- Reduced complexity in deployment (single application rather than two services)

- Direct use of Server Actions for ticket issuance and validation logic

- Better integration between UI components and backend logic

Faster development velocity within the limited timeline

We determined that while a separated architecture might offer stronger service isolation, the additional overhead in API management and deployment orchestration was unnecessary for the scope of this course project.

## 4.2 Data and State Design

We categorized system state into two layers:

Durable State (Persistent)

- Users, roles, events, ticket tiers

- Ticket status (UNUSED / USED / CANCELLED)

- Check-in timestamps and staff records

This data will be stored in PostgreSQL to ensure consistency and transactional integrity.

Live State (Real-Time)

- Current attendance count

- Recent check-in events

- Remaining ticket quota per tier

Live state will be synchronized using SSE or WebSocket to ensure that dashboard views update instantly without page refresh.

We identified ticket status transition as the most critical consistency point in the system. To prevent duplicate check-ins, we plan to use a conditional atomic update in the database to ensure a ticket can only transition from UNUSED to USED once.

## 4.3 Feature Selection and Scope Decisions

When selecting advanced features, we prioritized:

- Authentication and role-based authorization (essential for secure access)

- Real-time check-in dashboard (demonstrates full-stack integration)

- Non-trivial file processing (CSV import/export)

- Secure QR validation mechanism

We deliberately chose not to integrate real payment gateways, as payment APIs introduce additional complexity, compliance requirements, and edge cases beyond the course scope. Payment logic will be simulated instead.

We also decided against building a dedicated mobile application. Instead, we will focus on responsive web design optimized for mobile scanning usage.

## 4.4 Anticipated Challenges

We identified several potential challenges early on:

- Designing secure QR tokens to prevent duplication and replay attacks

- Ensuring atomic ticket validation under concurrent check-ins

- Implementing stable real-time communication without performance degradation

- Managing role-based UI rendering across multiple dashboards

- Handling camera permissions and mobile scanning reliability

Among these, preventing duplicate or fraudulent check-ins is expected to be the most technically sensitive component.

## 4.5 Early Collaboration Plan

We decided to divide work by vertical functional ownership rather than purely frontend/backend roles. Each member will own a core feature area while collaborating on database design and critical validation logic.

We plan to coordinate using:

- Weekly planning meetings

- Pull requests and peer code review

- Shared documentation for database schema and API contracts

Critical components such as ticket validation logic will require joint review to ensure correctness and security.

---

# 5. AI Assistance Disclosure

The overall project concept, system architecture choice, and feature selection were developed independently through team discussion prior to using any AI tools.

AI assistance was used only for:

- Refining wording and improving clarity of technical explanations

- Checking consistency of terminology

- Suggesting alternative phrasing for architectural justification

For example, AI suggested clarifying the distinction between durable state and live state. After reviewing this suggestion, we incorporated the terminology but expanded the explanation to explicitly connect it to ticket validation and real-time dashboard synchronization within our own system design.

All architectural decisions, database modeling choices, and feature scope limitations were determined by the team based on feasibility, course requirements, and time constraints.
