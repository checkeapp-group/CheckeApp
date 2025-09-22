export type Source = {
  id: string;
  verificationId: string;
  url: string;
  title?: string | null;
  summary?: string | null;
  domain?: string | null;
  isSelected: boolean;
  scrapingDate?: string | null;
  createdAt: string; 
}

export type NewSource = {
  verificationId: string;
  url: string;
  title?: string;
  summary?: string;
  domain?: string;
  isSelected?: boolean;
  scrapingDate?: string;
}
