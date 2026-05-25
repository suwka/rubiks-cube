export interface Algorithm {
  id: number;
  category: 'pll' | 'oll' | 'f2l' | string;
  name: string;
  moves: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
}
