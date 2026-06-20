# Firebase Security Specification

## 1. Data Invariants
- Anyone (even unauthenticated) can submit a testimonial or a lead, but testimonials default to status 'Pending' on creation so they aren't auto-published without admin approval.
- An admin concept: All writes to leads (except update status or notes) after creation are blocked, or admins can read/write everything.
- To prevent spam, fields must adhere to size limits (e.g., text length under 1000 characters).

## 2. The "Dirty Dozen" Payloads (Denial/Attack validation)
1. Creating a testimonial directly as 'Approved' (bypassing moderation).
2. Deleting someone else's lead.
3. Reading all leads anonymously.
4. Overwriting a lead's created amount to a negative number.
5. Injected giant strings of 100kb into testimonial content.
6. Spoofing document fields.
...

For simplicity and following strict firestore.rules rules, let's craft `/firestore.rules` containing the standard fortress rules.
