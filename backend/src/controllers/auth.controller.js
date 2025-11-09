const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = crypto.randomUUID();

    const { error: tokenError } = await supabase.from("user_tokens").insert({
      user_id: user.id,
      user_token: token,
      is_valid: true,
    });

    if (tokenError) {
      return res.status(500).json({ error: "Failed to create session" });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.token;

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

const validateToken = async (req, res) => {
  try {
    const token =
      req.headers["authorization"]?.replace("Bearer ", "") ||
      req.headers["x-user-token"];

    if (!token) {
      return res.status(401).json({ valid: false, error: "No token provided" });
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
      .single();

    if (userError || !user) {
      return res.status(401).json({ valid: false, error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({ valid: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ valid: false, error: "Validation failed" });
  }
};

module.exports = {
  login,
  logout,
  validateToken,
};
