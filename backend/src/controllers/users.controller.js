const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, email, first_name, last_name, created_at, updated_at"
      )
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, username, email } = req.body;

    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select(
        "id, username, email, first_name, last_name, created_at, updated_at"
      )
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        const { data: newSettings, error: createError } = await supabase
          .from("user_settings")
          .insert({
            user_id: userId,
            is_light_mode: true,
          })
          .select()
          .single();

        if (createError) {
          return res.status(500).json({ error: createError.message });
        }

        return res.json({ settings: newSettings });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ settings: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user settings" });
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from("user_settings")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ settings: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user settings" });
  }
};

const toggleDarkMode = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: currentSettings, error: fetchError } = await supabase
      .from("user_settings")
      .select("is_light_mode")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    const { data, error } = await supabase
      .from("user_settings")
      .update({ is_light_mode: !currentSettings.is_light_mode })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ settings: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle dark mode" });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(current_password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  toggleDarkMode,
  changePassword,
};
