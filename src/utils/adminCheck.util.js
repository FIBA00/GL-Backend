// FIX: shared ownership check — a user may act on their own account,
// an admin may act on any account. Extracted so Update/Delete stay in sync.
export default function isSelfOrAdmin(req, targetUserId) {
    return req.user._id.toString() === targetUserId || req.user.role === "admin";
}
