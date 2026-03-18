export type MiniappRole = "guest" | "staff" | "owner";

export interface LoginResult {
  token: string;
  refreshToken: string;
  roleType: MiniappRole;
  bindId: number;
  profile: Record<string, unknown>;
}
