import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlacesAutocomplete } from '@/components/ui/places-autocomplete';
import { useFormContext } from 'react-hook-form';
import type { AddressFormProps } from '../../CreateOrganizationPage.types';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export function AddressForm({ isSubmitting, showAISuggestions }: Omit<AddressFormProps, 'control'>) {
  const { control, setValue } = useFormContext();
  
  return (
    <div className="space-y-6">
      {/* Address Line 1 & 2 - Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address Line 1 */}
        <FormField
          control={control}
          name="address.line1"
          render={({ field }) => (
            <FormItem className="space-y-2.5">
              <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
                Address 1*
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="45, Street"
                  className={`h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400 ${
                    showAISuggestions && field.value ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage className="text-xs font-poppins" />
            </FormItem>
          )}
        />

        {/* Address Line 2 */}
        <FormField
          control={control}
          name="address.line2"
          render={({ field }) => (
            <FormItem className="space-y-2.5">
              <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
                Address 2
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="Address (optional)"
                  className="h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage className="text-xs font-poppins" />
            </FormItem>
          )}
        />
      </div>

      {/* City, State, Zip Code - Three Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* City */}
        <FormField
          control={control}
          name="address.city"
          render={({ field }) => (
            <FormItem className="space-y-2.5">
              <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
                City*
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="City name"
                  className={`h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400 ${
                    showAISuggestions && field.value ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage className="text-xs font-poppins" />
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          control={control}
          name="address.state"
          render={({ field }) => (
            <FormItem className="space-y-2.5">
              <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
                State*
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger className="h-12 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400">
                    <SelectValue placeholder="Select State" className="text-gray-400" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg rounded-lg font-poppins">
                  {US_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value} className="text-[14px] cursor-pointer hover:bg-gray-100 focus:bg-gray-100">
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs font-poppins" />
            </FormItem>
          )}
        />

        {/* Zip Code */}
        <FormField
          control={control}
          name="address.pincode"
          render={({ field }) => (
            <FormItem className="space-y-2.5">
              <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
                Zip Code*
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ''}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Postal code"
                  className="h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400"
                  disabled={isSubmitting}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    const numValue = value ? parseInt(value) : undefined;
                    field.onChange(numValue);
                  }}
                  maxLength={6}
                />
              </FormControl>
              <FormMessage className="text-xs font-poppins" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
