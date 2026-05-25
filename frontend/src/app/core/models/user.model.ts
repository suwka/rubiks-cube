export interface User {
  id: number;
  username: string;
  bio?: string | null;
  cubeSetup?: string | null;
  ao5?: number | null;
  ao12?: number | null;
  bestTimeMs?: number | null;
  createdAt?: string;
  email?: string;
  role?: 'user' | 'admin';
}
