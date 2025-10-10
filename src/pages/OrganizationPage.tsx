import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  PencilSimpleLine,
  DotsThreeVertical,
  House,
  CaretRight,
  ShieldCheckered,
} from 'phosphor-react';
import { useToast } from '@/hooks/useToast';
import { useMyOrganization } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';

export default function OrganizationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use centralized hooks following Development.md patterns
  const organizationQuery = useMyOrganization();
  const { authState } = useAuth();

  const organization = organizationQuery.data;
  const isLoading = organizationQuery.isLoading;
  const error = organizationQuery.error;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isAdmin = authState.user?.role === 'admin';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3F2]">
        <div className="max-w-5xl mx-auto px-4 md:px-20 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ED8A09]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !organization) {
    return (
      <div className="min-h-screen bg-[#F5F3F2]">
        <div className="max-w-5xl mx-auto px-4 md:px-20 py-12">
          <Card className="rounded-3xl shadow-sm bg-white border-none">
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <img src={image} alt="buildings-icon" className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-medium mb-2">Organization Not Found</h2>
                <p className="text-sm">{error?.message || 'Unable to load organization details'}</p>
              </div>
              <Button
                onClick={() => organizationQuery.refetch()}
                className="bg-[#ED8A09] hover:bg-[#ED8A09]/90 text-white"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F2]">
      {/* Main Content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb just above card */}
          <div className="text-sm text-gray-500 mb-8 flex flex-wrap gap-1 items-center">
            <House size={18} className="text-gray-700" />
            <CaretRight size={16} className="text-gray-700" />
            <Link to="/" className="hover:text-[#ED8A09]">
              Profile
            </Link>
            <CaretRight size={16} className="text-gray-700" />
            <span>Organization Detail</span>
          </div>

          {/* Form area - Main Card */}
          <div className="w-full max-w-[1000px] mx-auto p-6 sm:p-8 lg:p-10 bg-white rounded-2xl border border-gray-200 flex flex-col gap-6 sm:gap-8 shadow-sm">
            {/* Title with subtitle */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex flex-col gap-3">
                <h1 className="text-slate-800 text-3xl sm:text-4xl font-semibold font-['Outfit'] leading-tight sm:leading-10">
                  {organization.name}
                </h1>
                <Badge className="w-fit px-2.5 py-0.5 bg-emerald-500/10 rounded-[999px]">
                  <span className="text-emerald-500 text-sm font-medium font-['Outfit'] leading-tight">
                    Active Organization
                  </span>
                </Badge>
              </div>
              <div className="flex gap-3 self-start">
                {isAdmin && (
                  <button
                    className="size-10 p-2.5 bg-neutral-100 rounded-[50px] border-[0.5px] border-gray-200 flex justify-center items-center hover:bg-gray-200 transition-colors flex-shrink-0"
                    onClick={() => navigate('/organization/update')}
                  >
                    <PencilSimpleLine className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="size-10 p-2.5 bg-neutral-100 rounded-[50px] border-[0.5px] border-gray-200 flex justify-center items-center hover:bg-gray-200 transition-colors flex-shrink-0"
                  onClick={() => {
                    toast.info('Settings', {
                      description: 'Organization settings feature coming soon!',
                      duration: 3000,
                    });
                  }}
                >
                  <DotsThreeVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Administration Badge + Created on */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2">
              <Badge className="h-6 w-fit pl-1.5 pr-2 py-0.5 bg-[#ED8A09] rounded-[999px] flex items-center gap-1">
                <ShieldCheckered className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium font-['Outfit'] leading-none">
                  {isAdmin ? 'Administration' : 'Member'}
                </span>
              </Badge>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-neutral-400 text-sm font-medium font-['Outfit']">Created on</span>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[#0F0901] text-sm font-medium font-['Outfit']">
                  {formatDate(organization.created_at)}
                </span>
              </div>
            </div>

            {/* Form with social login - Content Area */}
            <div className="flex flex-col gap-6">
              {/* Text content */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 lg:gap-10">
                {/* Left side - Organization Details */}
                <div className="flex-1 flex flex-col gap-7">
                  <h2 className="text-slate-800 text-lg font-semibold font-['Outfit'] leading-7">
                    Organization Details
                  </h2>

                  <div className="flex flex-col gap-7">
                    {/* Company Website */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-gray-500 text-xs font-normal font-['Outfit'] leading-none">
                        Company Website
                      </span>
                      {organization.website ? (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm font-medium font-['Outfit'] leading-tight hover:underline break-all"
                        >
                          {organization.website}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm font-medium font-['Outfit'] leading-tight">
                          Not specified
                        </span>
                      )}
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-2.5">
                        <span className="text-gray-500 text-xs font-normal font-['Outfit'] leading-none">
                          Email address
                        </span>
                        <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight break-all">
                          {organization.contact?.email || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <span className="text-gray-500 text-xs font-normal font-['Outfit'] leading-none">
                          Phone
                        </span>
                        <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">
                          {organization.contact?.phone || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="flex flex-col gap-7">
                    {/* Address Line */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-gray-500 text-xs font-normal font-['Outfit'] leading-none">
                        Address
                      </span>
                      <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">
                        {organization.address?.line1 || 'Not specified'}
                        {organization.address?.line2 && `, ${organization.address.line2}`}
                      </span>
                    </div>

                    {/* City/State and Postal Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-2.5">
                        <span className="text-gray-500 text-xs font-normal font-['Outfit'] leading-none">
                          City/State
                        </span>
                        <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">
                          {organization.address?.city || organization.address?.state
                            ? [organization.address.city, organization.address.state].filter(Boolean).join(', ')
                            : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <span className="text-gray-500 text-xs font-normal font-['Outfit'] leading-none">
                          Postal Code
                        </span>
                        <span className="text-slate-800 text-sm font-medium font-['Outfit'] leading-tight">
                          {organization.address?.pincode || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Quick Actions */}
                <div className="w-full lg:w-72 py-5 bg-neutral-50 rounded-2xl border border-zinc-100 flex flex-col gap-2 flex-shrink-0">
                  <div className="flex flex-col gap-4">
                    <div className="px-6 flex flex-col gap-2">
                      <h3 className="text-slate-800 text-lg font-semibold font-['Outfit'] leading-7">
                        Quick Actions
                      </h3>
                    </div>
                    <div className="px-6">
                      <div className="h-px bg-black/10"></div>
                    </div>
                    <div className="flex flex-col px-4">
                      <button
                        onClick={() => navigate('/module/accounts')}
                        className="px-4 py-3 bg-indigo-50 rounded-lg flex items-center gap-3 hover:bg-indigo-100 transition-colors"
                      >
                        <span className="flex-1 text-[#4361EE] text-sm font-medium font-['Outfit'] leading-tight text-left">
                          View Accounts
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          toast.info('Settings', {
                            description: 'Settings management feature coming soon!',
                            duration: 3000,
                          });
                        }}
                        className="px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors"
                      >
                        <span className="flex-1 text-black text-sm font-medium font-['Outfit'] leading-tight text-left">
                          Manage Setting
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
