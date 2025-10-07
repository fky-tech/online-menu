import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ success: false, message: "Server misconfigured: JWT_SECRET not set" });
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Expect: "Bearer <token>"

    if (!token) {
        return res.status(403).json({ success: false, message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
        }

        req.admin = decoded; // Save decoded data (id, email) for use in controllers
        next();
    });
};
