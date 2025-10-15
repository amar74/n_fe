import { CreateOrgFormData } from '@/types/orgs';

export interface WebsiteAnalysisInfo {
  name?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  phone?: string[];
  email?: string[];
}

export interface WebsiteAnalysisResult {
  error?: string;
  info?: WebsiteAnalysisInfo;
}

export interface WebsiteAnalysisResponse {
  results: WebsiteAnalysisResult[];
}

export type CreateOrganizationFormProps = {
  onSubmit: (data: CreateOrgFormData) => Promise<void>;
  isSubmitting: boolean;
}

export type AddressFormProps = {
  control: any; // Replace with proper form control type
  isSubmitting: boolean;
  showAISuggestions: boolean;
}

export type ContactFormProps = {
  control: any; // Replace with proper form control type
  isSubmitting: boolean;
  userEmail?: string;
}
