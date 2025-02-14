import jwt from "jsonwebtoken";
import { Users } from "./models.js";
import "dotenv/config";

const ats = process.env.ACCESS_TOKEN_SECRET;

export const isLogin = async (req, res, next) => {
  try {
    const token = req.cookies.accessTokenApiMooV3;

    if (!token) {
      return res.status(401).json({ error: `unauthorized, your not logged in` });
    }

    const decoded = jwt.verify(token, ats);

    const user = await Users.findById(decoded.id).select(["-__v", "-password"]);
    if (!user) {
      return res.status(401).json({ error: `unauthorized, your not logged in` });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const matchUser = (allowedRoles = []) => {
  return async (req, res, next) => {
    const { id } = req.params;

    if (req.user.role === "admin") return next();

    if (id) {
      const targetUser = await Users.findById(id).select(["-__v", "-password"]);
      if (!targetUser) return res.status(400).json({ error: `User id ${id} not found!` });

      // Editor hanya bisa mengakses user dengan role 'user' atau 'editor'
      if (req.user.role === "editor" && (targetUser.role === "user" || targetUser.role === "editor")) {
        return next();
      }

      // User hanya bisa mengakses dirinya sendiri
      if (req.user.role === "user" && req.user.id.toString() === id) {
        return next();
      }

      return res.status(403).json({ error: "Forbidden: You cannot access this resource" });
    }

    // Jika tidak ada ID, cek apakah role user diizinkan untuk akses route ini
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: You do not have permission" });
    }

    next();
  };
};
