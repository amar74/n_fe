import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import type { ContactFormProps } from '../../CreateOrganizationPage.types';

// @author rose11
const COUNTRY_CODES = [
  { value: '+1', label: 'US (+1)', flag: '🇺🇸' },
  { value: '+91', label: 'IN (+91)', flag: '🇮🇳' },
  { value: '+44', label: 'UK (+44)', flag: '🇬🇧' },
  { value: '+61', label: 'AU (+61)', flag: '🇦🇺' },
  { value: '+86', label: 'CN (+86)', flag: '🇨🇳' },
];

export function ContactForm({ control, isSubmitting, userEmail }: ContactFormProps) {
  const [countryCode, setCountryCode] = useState('+1');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <FormField
        control={control}
        name="contact.email"
        render={({ field }) => (
          <FormItem className="space-y-2.5">
            <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
              Email address*
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="example@gmail.com"
                className="h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage className="text-xs font-poppins" />
          </FormItem>
        )}
      />

      
      <FormField
        control={control}
        name="contact.phone"
        render={({ field }) => (
          <FormItem className="space-y-2.5">
            <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
              Phone
            </FormLabel>
            <div className="flex gap-2">
              
              <Select
                value={countryCode}
                onValueChange={(value) => {
                  setCountryCode(value);
                  if (field.value) {
                    const phoneWithoutCode = field.value.replace(/^\+\d{1,3}\s?/, '');
                    field.onChange(`${value} ${phoneWithoutCode}`);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-32 h-12 px-3 py-2.5 bg-white rounded-lg border border-gray-300 text-[14px] font-poppins focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {COUNTRY_CODES.map((country) => (
                    <SelectItem key={country.value} value={country.value} className="font-poppins">
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.value}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="(555) 123 4567"
                  onChange={(e) => {
                    const phoneNumber = e.target.value;
                    field.onChange(`${countryCode} ${phoneNumber}`);
                  }}
                  value={field.value ? field.value.replace(/^\+\d{1,3}\s?/, '') : ''}
                  className="flex-1 h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </FormControl>
            </div>
            <FormMessage className="text-xs font-poppins" />
          </FormItem>
        )}
      />
    </div>
  );
}
