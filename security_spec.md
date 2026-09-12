# Security Specification: Closer Firestore Database

## 1. Data Invariants
- **Public Recipient Access**: Recipients need to read active experiences without needing an account (public read if `active == true`).
- **Creator Ownership**: Only the creator/owner can modify or delete their experiences. `ownerId` cannot be spoofed or altered.
- **Recipient Submissions**: Anyone with a valid link can create a response for an existing, active experience. Responses cannot be modified or tampered with once submitted (immutable once recorded).
- **Creator Response Privacy**: Only the creator who owns the parent experience can read or delete submitted responses.
- **Identity & Schema Constraints**: All string fields must have length bounds (`<= 128`, `<= 256`, `<= 1000`). Keys and types must be strictly validated.

## 2. The Dirty Dozen Payloads
1. **Ghost Field in Experience Creation**: Payload containing `hacked: true` not matching schema -> REJECTED.
2. **Owner Spoofing**: User A creating experience with `ownerId: 'user-b'` -> REJECTED.
3. **Owner Modification on Update**: Updating experience attempting to change `ownerId` -> REJECTED.
4. **Oversized String Attack**: Experience title with > 256 characters -> REJECTED.
5. **Junk Document ID**: Injecting non-alphanumeric or 2KB ID -> REJECTED (`isValidId`).
6. **Inactive Experience Creation**: Submitting response to non-existent or inactive experience -> REJECTED.
7. **Response Tampering / Overwrite**: Attempting to update or mutate a submitted response -> REJECTED (responses are write-once).
8. **Unauthorized Response Read**: Stranger attempting to list or read another creator's responses -> REJECTED.
9. **Invalid Timestamp**: Payload sending future or fake client timestamps -> REJECTED (`request.time` or valid string).
10. **Array Explosion Attack**: Creating an experience with unbounded 10,000 array elements -> REJECTED (`questions.size() <= 30`).
11. **Blanket Query Scraping**: Attempting an unrestricted list read on all responses without owner scoping -> REJECTED.
12. **Negative / NaN View Counts**: Attempting to set `viewCount: -999` or non-number -> REJECTED.
