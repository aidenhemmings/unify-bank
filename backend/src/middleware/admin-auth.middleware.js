const supabase = require("../config/supabase");

/**
 * Authenticates an admin token.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @param {*} next - The next middleware function in the chain.
 * @returns A JSON response indicating authentication success or failure.
 */
const authenticateAdminToken = async (req, res, next) => {
  try {
    const token =
      req.headers["authorization"]?.replace("Bearer ", "") ||
      req.headers["x-admin-token"];

    if (!token || !token.startsWith("admin_")) {
      return res.status(401).json({ error: "No valid admin token provided" });
    }

    const { data: tokenData, error } = await supabase
      .from("user_tokens")
      .select("user_id, is_valid")
      .eq("user_token", token)
      .eq("is_valid", true)
      .single();

    if (error || !tokenData) {
      return res.status(401).json({ error: "Invalid or expired admin token" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", tokenData.user_id)
      .eq("role", "admin")
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: "Admin not found" });
    }

    if (user.is_active === false) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    req.admin = user;
    req.adminToken = token;

    next();
  } catch (error) {
    res.status(500).json({ error: "Admin authentication failed" });
  }
};

module.exports = { authenticateAdminToken };
