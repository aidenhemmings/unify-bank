const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * Logs in an admin user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the admin user and token or an error message.
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Get user with admin role
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("role", "admin")
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Check if user is active
    if (user.is_active === false) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = crypto.randomUUID();

    // Use the existing user_tokens table with a special prefix for admin tokens
    const { error: tokenError } = await supabase.from("user_tokens").insert({
      user_id: user.id,
      user_token: `admin_${token}`,
      is_valid: true,
    });

    if (tokenError) {
      return res.status(500).json({ error: "Failed to create session" });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      admin: userWithoutPassword,
      token: `admin_${token}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * Logs out an admin user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const logout = async (req, res) => {
  try {
    const token = req.adminToken;

    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    const { error } = await supabase
      .from("user_tokens")
      .update({ is_valid: false })
      .eq("user_token", token);

    if (error) {
      return res.status(500).json({ error: "Failed to logout" });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};

/**
 * Validates an admin token.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating if the token is valid or an error message.
 */
const validateToken = async (req, res) => {
  try {
    const token =
      req.headers["authorization"]?.replace("Bearer ", "") ||
      req.headers["x-admin-token"];

    if (!token || !token.startsWith("admin_")) {
      return res
        .status(401)
        .json({ valid: false, error: "No valid admin token provided" });
    }

    const { data: tokenData, error } = await supabase
      .from("user_tokens")
      .select("user_id, is_valid")
      .eq("user_token", token)
      .eq("is_valid", true)
      .single();

    if (error || !tokenData) {
      return res.status(401).json({ valid: false, error: "Invalid token" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", tokenData.user_id)
      .eq("role", "admin")
      .single();

    if (userError || !user) {
      return res.status(401).json({ valid: false, error: "Admin not found" });
    }

    if (user.is_active === false) {
      return res
        .status(401)
        .json({ valid: false, error: "Account is deactivated" });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({ valid: true, admin: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ valid: false, error: "Validation failed" });
  }
};

/**
 * Gets the current admin profile.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the admin profile or an error message.
 */
const getProfile = async (req, res) => {
  try {
    const { password: _, ...adminWithoutPassword } = req.admin;
    res.json({ admin: adminWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: "Failed to get profile" });
  }
};

/**
 * Updates the current admin's password.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new password are required" });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      req.admin.password,
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.BCRYPT_ROUNDS) || 10,
    );

    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", adminId);

    if (error) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update password" });
  }
};

module.exports = {
  login,
  logout,
  validateToken,
  getProfile,
  updatePassword,
};
