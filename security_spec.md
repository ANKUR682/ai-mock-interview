# Security Specification: AI Mock Interview Platform

## 1. Data Invariants
1. An interview document can only be created by an authenticated user where `request.auth.uid == incoming().userId`.
2. A user can only list, read, update, or delete interviews where `resource.data.userId == request.auth.uid`.
3. Documents in the `users` collection must match the user's UID (`request.auth.uid == userId`) for read and write.
4. An interview cannot modify immutable fields (`userId`, `createdAt`) during updates.
5. Interview `jobTitle` must not exceed 150 characters, and `jobDescription` must not exceed 5000 characters.
6. The status can only transition from `in_progress` to `completed`. Once `completed`, answers and evaluation cannot be altered by unauthorized users.
7. Any document ID must be valid (`isValidId(id)`).
8. Catch-all default deny must block access to any other collections or paths.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Unauthenticated Read:** Anonymous user attempts `get /interviews/doc123` -> PERMISSION_DENIED.
2. **User Impersonation Write:** User A attempts to create interview with `userId: "user_B"` -> PERMISSION_DENIED.
3. **Cross-Tenant Read:** User A attempts `get /interviews/{userB_interviewId}` -> PERMISSION_DENIED.
4. **Cross-Tenant List Query:** User A queries `interviews` without filtering `userId == User A` -> PERMISSION_DENIED.
5. **Cross-Tenant Update:** User A attempts `update /interviews/{userB_interviewId}` -> PERMISSION_DENIED.
6. **Cross-Tenant Delete:** User A attempts `delete /interviews/{userB_interviewId}` -> PERMISSION_DENIED.
7. **Immutable Field Tampering:** User A attempts to update existing interview with a new `userId: "user_C"` -> PERMISSION_DENIED.
8. **Resource Poisoning (Junk ID):** Attempting to write with 2KB junk character doc ID -> PERMISSION_DENIED.
9. **Volumetric Overflow:** Attempting to store `jobTitle` with > 150 chars or `jobDescription` with > 5000 chars -> PERMISSION_DENIED.
10. **State Corruption:** Attempting to set an invalid `status: "hacked"` instead of "in_progress" | "completed" -> PERMISSION_DENIED.
11. **User Profile Hijacking:** User A attempts to write to `/users/{userB_uid}` -> PERMISSION_DENIED.
12. **Catch-All Probe:** Attempting to read or write to `/system_config` or arbitrary `/admins` collection -> PERMISSION_DENIED.
