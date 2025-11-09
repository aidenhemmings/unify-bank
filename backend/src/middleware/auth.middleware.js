const supabase = require("../config/supabase");

const authenticateToken = async (req, res, next) => {
  try {
    const token =
      req.headers["authorization"]?.replace("Bearer ", "") ||
      req.headers["x-user-token"];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { data: tokenData, error } = await supabase
      .from("user_tokens")
      .select("user_id, is_valid")
      .eq("user_token", token)
      .eq("is_valid", true)
      .single();

    if (error || !tokenData) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", tokenData.user_id)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: "User not found" });
    }

    try {
      await supabase.rpc("set_user_token", { token });
    } catch (rpcError) {}

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = { authenticateToken };
