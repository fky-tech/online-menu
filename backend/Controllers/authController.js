import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findAdminByEmail, createAdmin, createTenantAdmin } from "../Models/authModel.js";

// ================== REGISTER ADMIN ==================
export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check existing admin
        const existingAdmin = await findAdminByEmail(email);
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await createAdmin(name, email, password_hash);

        res.status(201).json({ success: true, data: admin });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to register admin" });
    }
};

// ================== LOGIN ADMIN ==================
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await findAdminByEmail(email);
        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, admin.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ success: false, message: "Server misconfigured: JWT_SECRET not set" });
        }
        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role, restaurant_id: admin.restaurant_id || null },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.status(200).json({ success: true, message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);  // <---- ADD THIS
        res.status(500).json({ success: false, message: "Login failed" });
    }
};

// ================== CREATE TENANT ADMIN (SUPER ONLY) ==================
export const createTenantAdminController = async (req, res) => {
    try {
        const { name, email, password, restaurant_id } = req.body;
        if (!name || !email || !password || !restaurant_id) {
            return res.status(400).json({ success: false, message: "name, email, password, restaurant_id required" });
        }
        if (req.admin?.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const existing = await findAdminByEmail(email);
        if (existing) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }
        const password_hash = await bcrypt.hash(password, 10);
        const tenantAdmin = await createTenantAdmin(name, email, password_hash, restaurant_id);
        res.status(201).json({ success: true, data: tenantAdmin });
    } catch (e) {
        res.status(500).json({ success: false, message: "Failed to create tenant admin" });
    }
};

// ================== WHO AM I ==================
export const whoAmI = async (req, res) => {
    return res.status(200).json({ success: true, data: req.admin || null });
};

