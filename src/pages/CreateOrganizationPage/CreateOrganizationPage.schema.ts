import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

const postalCodeRegex = /^[0-9]{5,6}$/;

export const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  
  website: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val== '') return true; // Optional field
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(val);
    }, 'Please enter a valid website URL'),
  
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z
      .number()
      .optional()
      .refine((val) => {
        if (val === undefined || val === null) return true; // Optional field
        return postalCodeRegex.test(val.toString());
      }, 'Please enter a valid postal code (5-6 digits)'),
  }).optional(),
  
  contact: z.object({
    email: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val== '') return true; // Optional field
        return emailRegex.test(val);
      }, 'Please enter a valid email address'),
    
    phone: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val== '') return true; // Optional field
        // temp solution by rose11
        const cleanPhone = val.replace(/[\s\-\(\)]/g, '');
        return phoneRegex.test(cleanPhone);
      }, 'Please enter a valid phone number'),
  }).optional(),
}).refine((data) => {
  // At least one contact method should be provided if contact object exists
  if (data.contact && (data.contact.email || data.contact.phone)) {
    return true;
  }
  if (!data.contact || (!data.contact.email && !data.contact.phone)) {
    return true; // No contact is fine
  }
  return true;
}, {
  message: 'Please provide at least one contact method',
  path: ['contact'],
});

export type CreateOrganizationFormData = z.infer<typeof CreateOrganizationSchema>;
