# Security Specification

## Data Invariants
1. A user can only read and write their own profile (except admins).
2. Only admins can create, update, or delete products and categories.
3. Users can only read their own orders. Admins can read all orders.
4. Orders are immutable once cancelled or delivered (mostly).
5. Settings and Admin list are only editable by admins.
6. Support tickets can be read by the owner or an admin.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Attempt to create an order with a different `userId`.
2. **Privilege Escalation**: Attempt to set `role: "admin"` on a user profile.
3. **Resource Poisoning**: Use a 1MB string as a product `id`.
4. **Unauthorized Read**: Attempt to read another user's order by guessed ID.
5. **Admin Bypass**: Attempt to create a product without being in the `/admins/` collection.
6. **State Shortcut**: Attempt to update an order status from "Processing" directly to "Delivered" without being an admin.
7. **Malformed Data**: Attempt to set `price` to a negative number or a string.
8. **Shadow Field**: Adding `isVerified: true` to a user profile update.
9. **Terminal Lock Bypass**: Trying to update a "Cancelled" order.
10. **Query Scraping**: Attempting to list ALL orders without a `userId` filter.
11. **System Field Modification**: Modifying `createdAt` during an update.
12. **PII Leak**: A signed-in user trying to `get` the email of another user.

## Test Runner (firestore.rules.test.ts)
(To be implemented if needed, but for now focusing on the rules themselves following the 8 pillars)
