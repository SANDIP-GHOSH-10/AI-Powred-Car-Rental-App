export default function authorize(...allowedRoles) {
    return (req, res, next) => {

        // Authentication should run before authorization
        if (!req.userId) {
            return res.status(401).json({
                error: "Authentication required",
            });
        }

        // Check if user has roles
        if (!req.roles || !Array.isArray(req.roles)) {
            return res.status(403).json({
                error: "User roles not found",
            });
        }

        // Check whether user has at least
        // one of the allowed roles
        const hasRole = req.roles.some((role) =>
            allowedRoles.includes(role)
        );

        if (!hasRole) {
            return res.status(403).json({
                error: "You do not have permission to perform this action",
            });
        }

        next();
    };
}