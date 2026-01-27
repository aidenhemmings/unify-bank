const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * Retrieves all users with optional filtering.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the users or an error message.
 */
const getAllUsers = async (req, res) => {
  try {
    let query = supabase
      .from("users")
      .select(
        "id, username, email, first_name, last_name, role, is_active, created_at",
      )
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ users: data, total: data.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * Retrieves a specific user by ID.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the user or an error message.
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("users")
      .select(
        "id, username, email, first_name, last_name, role, is_active, created_at",
      )
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

/**
 * Updates a user's details.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the updated user or an error message.
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, is_active } = req.body;

    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select(
        "id, username, email, first_name, last_name, role, is_active, created_at",
      )
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

/**
 * Deactivates a user (soft delete).
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating yourself
    if (id === req.admin.id) {
      return res
        .status(400)
        .json({ error: "Cannot deactivate your own account" });
    }

    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Invalidate all user tokens
    await supabase
      .from("user_tokens")
      .update({ is_valid: false })
      .eq("user_id", id);

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate user" });
  }
};

/**
 * Reactivates a user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("users")
      .update({ is_active: true })
      .eq("id", id)
      .select(
        "id, username, email, first_name, last_name, role, is_active, created_at",
      )
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ user: data, message: "User reactivated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reactivate user" });
  }
};

/**
 * Permanently deletes a user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.admin.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // First delete related data
    await supabase.from("user_tokens").delete().eq("user_id", id);
    await supabase.from("user_settings").delete().eq("user_id", id);

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "User deleted permanently" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

/**
 * Creates an invitation for a new user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the invitation or an error message.
 */
const inviteUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A user with this email already exists" });
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from("user_invitations")
      .select("id")
      .eq("email", email)
      .eq("status", "pending")
      .single();

    if (existingInvite) {
      return res
        .status(400)
        .json({ error: "An invitation is already pending for this email" });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const { data: invitation, error } = await supabase
      .from("user_invitations")
      .insert({
        email,
        invite_token: inviteToken,
        invited_by: req.admin.id,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Generate the invite link
    const inviteLink = `${process.env.FRONTEND_URL || "https://localhost:4200"}/auth/accept-invite?token=${inviteToken}`;

    res.status(201).json({
      invitation,
      inviteLink,
      message: "Invitation created successfully. Send this link to the user.",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create invitation" });
  }
};

/**
 * Retrieves all invitations.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the invitations or an error message.
 */
const getInvitations = async (req, res) => {
  try {
    // First get all invitations
    const { data: invitations, error } = await supabase
      .from("user_invitations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get unique inviter IDs
    const inviterIds = [
      ...new Set(invitations.map((inv) => inv.invited_by).filter(Boolean)),
    ];

    // Fetch inviter details separately
    let invitersMap = {};
    if (inviterIds.length > 0) {
      const { data: inviters } = await supabase
        .from("users")
        .select("id, username, first_name, last_name")
        .in("id", inviterIds);

      if (inviters) {
        invitersMap = inviters.reduce((acc, inv) => {
          acc[inv.id] = inv;
          return acc;
        }, {});
      }
    }

    // Attach inviter info to each invitation
    const invitationsWithInviters = invitations.map((inv) => ({
      ...inv,
      inviter: inv.invited_by ? invitersMap[inv.invited_by] || null : null,
    }));

    res.json({ invitations: invitationsWithInviters });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
};

/**
 * Cancels an invitation.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const cancelInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("user_invitations")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", "pending");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Invitation cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel invitation" });
  }
};

/**
 * Resends an invitation (creates a new token).
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the new invitation link or an error message.
 */
const resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const newToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from("user_invitations")
      .update({
        invite_token: newToken,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const inviteLink = `${process.env.FRONTEND_URL || "https://localhost:4200"}/auth/accept-invite?token=${newToken}`;

    res.json({
      invitation: data,
      inviteLink,
      message: "Invitation resent successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to resend invitation" });
  }
};

/**
 * Validates an invitation token (public endpoint).
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating if the token is valid or an error message.
 */
const validateInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const { data, error } = await supabase
      .from("user_invitations")
      .select("id, email, status, expires_at")
      .eq("invite_token", token)
      .single();

    if (error || !data) {
      return res
        .status(404)
        .json({ valid: false, error: "Invitation not found" });
    }

    if (data.status !== "pending") {
      return res
        .status(400)
        .json({ valid: false, error: "Invitation is no longer valid" });
    }

    if (new Date(data.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from("user_invitations")
        .update({ status: "expired" })
        .eq("id", data.id);

      return res
        .status(400)
        .json({ valid: false, error: "Invitation has expired" });
    }

    res.json({ valid: true, email: data.email });
  } catch (error) {
    res
      .status(500)
      .json({ valid: false, error: "Failed to validate invitation" });
  }
};

/**
 * Accepts an invitation and creates a new user account (public endpoint).
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the new user or an error message.
 */
const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { username, password, first_name, last_name } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Validate the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("invite_token", token)
      .eq("status", "pending")
      .single();

    if (inviteError || !invitation) {
      return res.status(404).json({ error: "Invalid or expired invitation" });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from("user_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);

      return res.status(400).json({ error: "Invitation has expired" });
    }

    // Check if username is taken
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS) || 10,
    );

    // Create the user
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        username,
        email: invitation.email,
        password: hashedPassword,
        first_name: first_name || "",
        last_name: last_name || "",
        role: "user",
        is_active: true,
      })
      .select(
        "id, username, email, first_name, last_name, role, is_active, created_at",
      )
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    // Mark invitation as accepted
    await supabase
      .from("user_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    // Create default user settings
    await supabase.from("user_settings").insert({
      user_id: newUser.id,
      is_light_mode: true,
    });

    res.status(201).json({
      user: newUser,
      message: "Account created successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
};

/**
 * Gets dashboard statistics.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the statistics or an error message.
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get user counts by role
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("role, is_active");

    if (usersError) {
      return res.status(500).json({ error: usersError.message });
    }

    const totalUsers = users.filter((u) => u.role === "user").length;
    const activeUsers = users.filter(
      (u) => u.role === "user" && u.is_active,
    ).length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;

    // Get account stats
    const { count: totalAccounts } = await supabase
      .from("accounts")
      .select("*", { count: "exact", head: true });

    // Get transaction stats
    const { count: totalTransactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });

    // Get payment stats
    const { count: totalPayments } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true });

    const { count: pendingPayments } = await supabase
      .from("payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Get pending invitations
    const { count: pendingInvitations } = await supabase
      .from("user_invitations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    res.json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          admins: totalAdmins,
          recentSignups: recentUsers || 0,
        },
        accounts: {
          total: totalAccounts || 0,
        },
        transactions: {
          total: totalTransactions || 0,
        },
        payments: {
          total: totalPayments || 0,
          pending: pendingPayments || 0,
        },
        invitations: {
          pending: pendingInvitations || 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
  inviteUser,
  getInvitations,
  cancelInvitation,
  resendInvitation,
  validateInvitation,
  acceptInvitation,
  getDashboardStats,
};
