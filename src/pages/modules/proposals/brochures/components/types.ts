export interface BrochureSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface DesignTheme {
  id: string;
  name: string;
  colors: string[];
  description: string;
}

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  file?: File;
  isSaved?: boolean;
  serverId?: string;
}

