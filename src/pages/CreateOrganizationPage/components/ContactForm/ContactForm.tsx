import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ContactFormProps } from '../../CreateOrganizationPage.types';

export function ContactForm({ control, isSubmitting, userEmail }: ContactFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Email Address */}
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

      {/* Phone */}
      <FormField
        control={control}
        name="contact.phone"
        render={({ field }) => (
          <FormItem className="space-y-2.5">
            <FormLabel className="text-[13px] font-medium text-gray-900 font-poppins">
              Phone
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                placeholder="(555) 123 4567"
                className="h-12 border-gray-300 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 font-poppins text-[14px] placeholder:text-gray-400"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage className="text-xs font-poppins" />
          </FormItem>
        )}
      />
    </div>
  );
}
