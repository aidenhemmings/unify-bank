export type UserRole = 'user' | 'admin';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  invite_token: string;
  invited_by: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  inviter?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    recentSignups: number;
  };
  accounts: {
    total: number;
  };
  transactions: {
    total: number;
  };
  payments: {
    total: number;
    pending: number;
  };
  invitations: {
    pending: number;
  };
}

export interface UsersResponse {
  users: AdminUser[];
  total: number;
}

export interface InvitationsResponse {
  invitations: UserInvitation[];
}

export interface InviteUserResponse {
  invitation: UserInvitation;
  inviteLink: string;
  message: string;
}

export interface ValidateInvitationResponse {
  valid: boolean;
  email?: string;
  error?: string;
}

export interface AcceptInviteRequest {
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
}
