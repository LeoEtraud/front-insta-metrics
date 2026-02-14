import { z } from "zod";

// Types (compatible with backend Prisma types)
export type User = {
  id: number;
  email: string;
  name: string;
  role: string;
  companyId: number | null;
  createdAt: string;
};

export type Company = {
  id: number;
  name: string;
  instagramBusinessAccountId: string | null;
  instagramAccessToken: string | null;
  createdAt: string;
};

export type InstagramPost = {
  id: number;
  companyId: number;
  instagramId: string;
  mediaType: string;
  mediaUrl: string | null;
  permalink: string | null;
  caption: string | null;
  timestamp: string;
  metrics: {
    likes: number;
    comments: number;
    [key: string]: any;
  };
  lastUpdated: string;
};

export type DailyMetric = {
  id: number;
  companyId: number;
  date: string;
  followersCount: number;
  reach: number;
  impressions: number;
  profileViews: number;
};

export type RefreshToken = {
  id: number;
  userId: number;
  token: string;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
};

// Constants
export const USER_ROLES = {
  ADMIN_SAAS: "admin_saas",
  ADMIN_COMPANY: "admin_company",
  ANALYST: "analyst",
  VIEWER: "viewer",
} as const;

export const POST_TYPES = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  CAROUSEL_ALBUM: "CAROUSEL_ALBUM",
  REELS: "REELS",
} as const;

// Zod Schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido").max(100, "O email deve ter no máximo 100 caracteres"),
  password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres").max(50, "A senha deve ter no máximo 50 caracteres"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenPayload {
  userId: number;
  role: string;
  companyId: number | null;
}

