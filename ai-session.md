# AI Interaction Record

## Session 1: Handling Duplicate Ticket Purchase and Data Consistency

### Prompt (you sent to AI)



We are implementing a ticket purchase system.
How can we prevent a user from purchasing the same ticket tier multiple times, while also ensuring that ticket capacity is not exceeded?

---

### AI Response (trimmed)

The AI suggested:

- checking if a ticket already exists for the user and ticket tier before inserting a new record
- validating available ticket quantity before purchase
- using database constraints or transactions to prevent race conditions
- returning appropriate error messages when validation fails

---

### What Your Team Did With It

- The suggestion to check for existing tickets before insertion was useful and directly applied in our backend logic.
- The AI recommendation about database constraints was too general and did not fully match our Prisma schema, so we implemented validation logic at the application level instead.
- We verified correctness through manual testing of edge cases, including repeated purchase attempts and scenarios where ticket capacity is nearly full.


---

## Session 2: Improving Ticket Validation Logic

### Prompt (you sent to AI)



We are implementing ticket purchase and check-in logic.
How can we ensure that:
1. users cannot purchase the same ticket tier multiple times
2. tickets cannot be checked in more than once

---

### AI Response (trimmed)

The AI suggested:

- adding database-level constraints or checks before insertion
- validating ticket ownership and event association
- checking a "checked-in" flag before allowing check-in
- returning appropriate error responses when validation fails

---

### What Your Team Did With It

- The validation strategy was useful, especially the idea of checking ticket status before check-in.
- The AI did not consider our exact schema, so we adapted the logic to match our Prisma models and application flow.
- We implemented additional checks in backend routes and verified correctness through manual testing of edge cases such as duplicate purchase attempts and repeated check-ins.

---

## Session 3: Improving Input Validation and Error Handling

### Prompt (you sent to AI)



We are validating user input for event creation (title, date, ticket tiers).
What is a good way to handle validation and provide clear error messages?

---

### AI Response (trimmed)

The AI suggested:

- using a validation library (e.g., Zod) to define schemas
- validating input both on client and server
- returning structured error messages for each field
- ensuring consistent validation logic across the application

---

### What Your Team Did With It

- The suggestion to use structured validation schemas was useful and aligned with our use of Zod.
- Some suggestions were too general and required adaptation to match our specific form structure and API routes.
- We implemented validation on both frontend and backend, and verified correctness by testing invalid inputs and ensuring appropriate error messages were displayed.