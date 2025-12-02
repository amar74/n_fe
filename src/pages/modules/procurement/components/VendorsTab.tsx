import React from 'react';
import { Plus, Building2, DollarSign, Clock, Eye, Edit3, Brain, AlertCircle, AlertTriangle, CheckCircle, TrendingUp, Star, FileCheck, Trash2, CheckCircle2, XCircle, Settings, Download, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusBadge } from '../utils';
import type { ProcurementVendor, ProcurementVendorStats, ProcurementVendorListResponse } from '@/hooks/useProcurementVendors';
import { useProcurementVendors } from '@/hooks/useProcurementVendors';
import { AddVendorModal, ViewVendorModal, EditVendorModal, VendorQualificationModal } from '../modals';
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMyOrganization } from '@/hooks/useOrganizations';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { procurementApi, type VendorQualificationResponse, type VendorPerformanceResponse } from '@/services/api/procurementApi';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VendorsTabProps {
  stats: ProcurementVendorStats | undefined;
  isStatsLoading: boolean;
  vendorsData: ProcurementVendorListResponse | undefined;
  isLoadingVendors: boolean;
}

export function VendorsTab({ stats, isStatsLoading, vendorsData, isLoadingVendors }: VendorsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingVendor, setViewingVendor] = useState<ProcurementVendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<ProcurementVendor | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);
  const [qualificationVendor, setQualificationVendor] = useState<{ id: string; name: string } | null>(null);
  const { authState } = useAuth();
  const { data: organization, isLoading: isOrgLoading } = useMyOrganization(!!authState.user?.org_id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get role from user object - handle both lowercase and any case variations
  const currentUserRole = authState.user?.role?.toLowerCase() || 'viewer';
  
  // IMPORTANT: "vendor" role = main owner/admin of subscribed application (full admin privileges)
  // They can manage all features like admin
  const isVendorRole = currentUserRole === 'vendor';
  
  // Check if user is organization owner
  const isOrgOwner = React.useMemo(() => {
    if (!organization || !authState.user?.id) return false;
    // Check if current user is the organization owner (compare as strings)
    const ownerId = typeof organization.owner_id === 'string' ? organization.owner_id : String(organization.owner_id);
    const userId = typeof authState.user.id === 'string' ? authState.user.id : String(authState.user.id);
    return ownerId === userId;
  }, [organization, authState.user?.id]);
  
  // Allow approval if user is admin, manager, vendor (main owner), or organization owner
  const canApprove = currentUserRole === 'admin' || currentUserRole === 'manager' || isVendorRole || isOrgOwner;
  
  const { 
    createVendor, 
    isCreating,
    updateVendor,
    isUpdating,
    updateVendorStatus,
    isUpdatingStatus,
    deleteVendor,
    isDeleting,
    useVendorDetail
  } = useProcurementVendors();

  // Fetch qualifications for all vendors (fetch all, not just active)
  const { data: allQualifications, isLoading: isLoadingQualifications, refetch: refetchQualifications, error: qualificationsError } = useQuery({
    queryKey: ['vendor-qualifications'],
    queryFn: async () => {
      try {
        // Fetch all qualifications (active_only=false) to show all qualifications
        return await procurementApi.getAllVendorQualifications(0, 1000, false);
      } catch (error: any) {
        // If list endpoint fails (404), try fetching individual qualifications as fallback
        if (error.response?.status === 404 && vendorsData?.vendors) {
          console.warn('List endpoint not available, fetching individual qualifications...');
          const individualQuals: VendorQualificationResponse[] = [];
          for (const vendor of vendorsData.vendors) {
            try {
              const qual = await procurementApi.getVendorQualification(vendor.id, false);
              if (qual) {
                individualQuals.push(qual);
              }
            } catch (err) {
              // Skip if individual fetch fails
              console.debug(`No qualification for vendor ${vendor.id}`);
            }
          }
          return individualQuals;
        }
        throw error;
      }
    },
    enabled: !!vendorsData?.vendors && vendorsData.vendors.length > 0,
    retry: 1,
    retryOnMount: false,
  });

  // Create a map of vendor_id -> qualification for quick lookup
  // Use the most recent qualification for each vendor (if multiple exist)
  const qualificationsMap = useMemo(() => {
    if (!allQualifications || allQualifications.length === 0) {
      return new Map<string, VendorQualificationResponse>();
    }
    const map = new Map<string, VendorQualificationResponse>();
    // Sort by created_at descending to get most recent first
    const sorted = [...allQualifications].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    sorted.forEach((qual) => {
      // Only set if not already in map (to get most recent)
      if (!map.has(qual.vendor_id)) {
        map.set(qual.vendor_id, qual);
      }
    });
    return map;
  }, [allQualifications]);

  // Fetch performance for vendors (only first 3 for display)
  const displayedVendors = vendorsData?.vendors?.slice(0, 3) || [];
  
  const vendor1Performance = useQuery({
    queryKey: ['vendor-performance', displayedVendors[0]?.id],
    queryFn: () => {
      if (!displayedVendors[0]?.id) throw new Error('Vendor ID required');
      return procurementApi.getVendorPerformance(displayedVendors[0].id);
    },
    enabled: !!displayedVendors[0]?.id,
  });

  const vendor2Performance = useQuery({
    queryKey: ['vendor-performance', displayedVendors[1]?.id],
    queryFn: () => {
      if (!displayedVendors[1]?.id) throw new Error('Vendor ID required');
      return procurementApi.getVendorPerformance(displayedVendors[1].id);
    },
    enabled: !!displayedVendors[1]?.id,
  });

  const vendor3Performance = useQuery({
    queryKey: ['vendor-performance', displayedVendors[2]?.id],
    queryFn: () => {
      if (!displayedVendors[2]?.id) throw new Error('Vendor ID required');
      return procurementApi.getVendorPerformance(displayedVendors[2].id);
    },
    enabled: !!displayedVendors[2]?.id,
  });

  // Create a map of vendor_id -> performance for quick lookup
  const performanceMap = useMemo(() => {
    const map = new Map<string, VendorPerformanceResponse>();
    if (displayedVendors[0]?.id && vendor1Performance.data) {
      map.set(displayedVendors[0].id, vendor1Performance.data);
    }
    if (displayedVendors[1]?.id && vendor2Performance.data) {
      map.set(displayedVendors[1].id, vendor2Performance.data);
    }
    if (displayedVendors[2]?.id && vendor3Performance.data) {
      map.set(displayedVendors[2].id, vendor3Performance.data);
    }
    return map;
  }, [displayedVendors, vendor1Performance.data, vendor2Performance.data, vendor3Performance.data]);

  const handleSaveQualification = async (data: {
    vendor_id: string;
    financial_stability?: string;
    credentials_verified: boolean;
    certifications?: string[];
    qualification_score?: number;
    risk_level?: string;
    notes?: string;
  }) => {
    try {
      await procurementApi.createVendorQualification(data);
      toast({
        title: 'Success',
        description: 'Vendor qualification saved successfully',
      });
      setQualificationVendor(null);
      // Invalidate and refetch qualifications query to refresh
      queryClient.invalidateQueries({ queryKey: ['vendor-qualifications'] });
      // Also refetch individual vendor qualification
      queryClient.invalidateQueries({ queryKey: ['vendor-qualification', data.vendor_id] });
      // Manually refetch to ensure data is updated
      await refetchQualifications();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to save qualification',
        variant: 'destructive',
      });
    }
  };

  const handleCreateVendor = async (data: {
    vendorName: string;
    organisation: string;
    email: string;
    contactNumber: string;
    address?: string;
    paymentTerms?: string;
    taxId?: string;
    website?: string;
    notes?: string;
  }) => {
    try {
      await createVendor({
        vendor_name: data.vendorName,
        organisation: data.organisation,
        email: data.email,
        contact_number: data.contactNumber,
        website: data.website || undefined,
        address: data.address || undefined,
        payment_terms: data.paymentTerms || undefined,
        tax_id: data.taxId || undefined,
        notes: data.notes || undefined,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  const handleUpdateVendor = async (data: {
    vendorName: string;
    organisation: string;
    email: string;
    contactNumber: string;
    website?: string;
    address?: string;
    paymentTerms?: string;
    taxId?: string;
    notes?: string;
  }) => {
    if (!editingVendor) return;
    try {
      await updateVendor({
        vendorId: editingVendor.id,
        data: {
          vendor_name: data.vendorName,
          organisation: data.organisation,
          contact_number: data.contactNumber,
          website: data.website || undefined,
          address: data.address || undefined,
          payment_terms: data.paymentTerms || undefined,
          tax_id: data.taxId || undefined,
          notes: data.notes || undefined,
        },
      });
      setEditingVendor(null);
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await updateVendorStatus({ vendorId, status: 'approved' });
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    try {
      await updateVendorStatus({ vendorId, status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting vendor:', error);
    }
  };

  const handleDeleteVendor = async () => {
    if (!deletingVendorId) return;
    try {
      await deleteVendor(deletingVendorId);
      setDeletingVendorId(null);
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const handleExportVendors = async () => {
    if (!vendorsData?.vendors || vendorsData.vendors.length === 0) {
      toast({
        title: 'No Data',
        description: 'No vendors to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch all qualifications and performance data
      const allQuals = allQualifications || [];
      const allPerfs: VendorPerformanceResponse[] = [];

      // Fetch performance for all vendors
      for (const vendor of vendorsData.vendors) {
        try {
          const perf = await procurementApi.getVendorPerformance(vendor.id);
          if (perf) {
            allPerfs.push(perf);
          }
        } catch (error) {
          // Skip if performance data not available
          console.debug(`No performance data for vendor ${vendor.id}`);
        }
      }

      // Create CSV headers
      const headers = [
        'Vendor ID',
        'Vendor Name',
        'Organization',
        'Email',
        'Contact Number',
        'Website',
        'Address',
        'Payment Terms',
        'Tax ID',
        'Status',
        'Created At',
        'Updated At',
        // Qualification fields
        'Financial Stability',
        'Credentials Verified',
        'Certifications',
        'Qualification Score',
        'Risk Level',
        'Qualification Notes',
        'Last Assessed',
        'Assessed By',
        // Performance fields
        'Total Orders',
        'Total Spend',
        'Average Delivery Time (days)',
        'On-Time Delivery Rate (%)',
        'Quality Rating',
        'Communication Rating',
        'Overall Rating',
        'Performance Trend',
        'Last Order Date',
      ];

      // Create CSV rows
      const rows = vendorsData.vendors.map((vendor) => {
        const qual = qualificationsMap.get(vendor.id);
        const perf = allPerfs.find((p) => p.vendor_id === vendor.id);

        return [
          vendor.id,
          vendor.vendor_name || '',
          vendor.organisation || '',
          vendor.email || '',
          vendor.contact_number || '',
          vendor.website || '',
          vendor.address || '',
          vendor.payment_terms || '',
          vendor.tax_id || '',
          vendor.status || '',
          vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : '',
          vendor.updated_at ? new Date(vendor.updated_at).toLocaleDateString() : '',
          // Qualification data
          qual?.financial_stability || '',
          qual?.credentials_verified ? 'Yes' : 'No',
          qual?.certifications?.join('; ') || '',
          qual?.qualification_score?.toString() || '',
          qual?.risk_level || '',
          qual?.notes || '',
          qual?.last_assessed ? new Date(qual.last_assessed).toLocaleDateString() : '',
          qual?.assessed_by || '',
          // Performance data
          perf?.total_orders?.toString() || '0',
          perf?.total_spend ? `$${Number(perf.total_spend).toFixed(2)}` : '$0.00',
          perf?.average_delivery_time?.toFixed(2) || '0',
          perf?.on_time_delivery_rate?.toFixed(2) || '0',
          perf?.quality_rating?.toFixed(2) || '0',
          perf?.communication_rating?.toFixed(2) || '0',
          perf?.overall_rating?.toFixed(2) || '0',
          perf?.performance_trend || '',
          perf?.last_order_date ? new Date(perf.last_order_date).toLocaleDateString() : '',
        ];
      });

      // Convert to CSV format
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => {
            // Escape commas and quotes in cell values
            const cellStr = String(cell || '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: `Exported ${vendorsData.vendors.length} vendors to CSV`,
      });
    } catch (error: any) {
      console.error('Error exporting vendors:', error);
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export vendors',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A] font-outfit mb-1">Vendor Management</h2>
          <p className="text-sm text-gray-600 font-outfit">Manage vendor relationships and track performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-[#161950] text-[#161950] hover:bg-[#161950]/10 font-outfit h-11 px-6"
            onClick={handleExportVendors}
            disabled={isLoadingVendors || !vendorsData?.vendors || vendorsData.vendors.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Vendor
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)] font-outfit hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Active Vendors</span>
            <div className="rounded-lg bg-[#161950]/10 p-2">
              <Building2 className="h-5 w-5 text-[#161950]" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[#1A1A1A] font-outfit">
              {isStatsLoading ? '...' : stats?.total_approved || 0}
            </span>
            <span className="text-sm font-medium text-gray-600 font-outfit">Approved</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)] font-outfit hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Total Vendors</span>
            <div className="rounded-lg bg-[#161950]/10 p-2.5">
              <DollarSign className="h-5 w-5 text-[#161950]" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[#1A1A1A] font-outfit">
              {isStatsLoading ? '...' : stats?.total_vendors || 0}
            </span>
            <span className="text-sm font-medium text-gray-600 font-outfit">All vendors</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)] font-outfit hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Pending</span>
            <div className="rounded-lg bg-[#161950]/10 p-2.5">
              <Clock className="h-5 w-5 text-[#161950]" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[#1A1A1A] font-outfit">
              {isStatsLoading ? '...' : stats?.total_pending || 0}
            </span>
            <span className="text-sm font-medium text-gray-600 font-outfit">Awaiting approval</span>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-[#161950]" />
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Vendor Directory</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 font-outfit">All registered vendors and their details</p>
        </div>
        {isLoadingVendors ? (
          <div className="py-12 px-4 text-center text-gray-500 font-outfit">Loading vendors...</div>
        ) : vendorsData?.vendors && vendorsData.vendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-outfit">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Vendor Name</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Organization</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Contact</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Payment Terms</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Tax ID</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Status</th>
                  <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorsData.vendors.map((vendor) => {
                  const statusBadge = getStatusBadge(vendor.status);
                  return (
                    <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-[#1A1A1A] text-sm font-outfit mb-1">{vendor.vendor_name}</div>
                        <div className="text-xs text-gray-500 font-outfit">{vendor.id}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700 font-outfit mb-1">{vendor.organisation}</div>
                        {vendor.website && (
                          <div className="text-xs text-gray-500 font-outfit flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <a 
                              href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {vendor.website}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-[#1A1A1A] font-outfit mb-1">{vendor.email}</div>
                        <div className="text-xs text-gray-500 font-outfit">{vendor.contact_number}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700 font-outfit">{vendor.payment_terms || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-700 font-outfit">{vendor.tax_id || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusBadge.className} font-outfit text-xs`}>{statusBadge.label}</Badge>
                          {/* Approval button - more prominent for pending vendors */}
                          {canApprove && vendor.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white font-outfit h-8 px-3 text-xs"
                              onClick={() => handleApproveVendor(vendor.id)}
                              disabled={isUpdatingStatus}
                              title="Approve vendor"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              {isUpdatingStatus ? 'Approving...' : 'Approve'}
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 font-outfit h-8 w-8 p-0"
                            onClick={() => setViewingVendor(vendor)}
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-gray-200 hover:bg-gray-50 hover:border-[#161950]/30 font-outfit h-8 w-8 p-0"
                            onClick={() => setEditingVendor(vendor)}
                            title="Edit vendor"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          {canApprove && vendor.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-orange-200 hover:bg-orange-50 hover:border-orange-400 text-orange-600 font-outfit h-8 px-3"
                              onClick={() => handleRejectVendor(vendor.id)}
                              disabled={isUpdatingStatus}
                              title="Reject vendor"
                            >
                              Reject
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-200 hover:bg-red-50 hover:border-red-400 text-red-600 font-outfit h-8 w-8 p-0"
                            onClick={() => setDeletingVendorId(vendor.id)}
                            disabled={isDeleting}
                            title="Delete vendor"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 px-4 text-center text-gray-500 font-outfit">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="font-outfit">No vendors found</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="mb-6 pb-4 border-b border-amber-200">
            <div className="flex items-center space-x-2 mb-1">
              <div className="rounded-lg bg-amber-100 p-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Top Vendors by Spend</h3>
            </div>
            <p className="text-sm text-gray-600 font-outfit">Quarterly spending analysis by vendor</p>
          </div>
          <div className="space-y-3">
            {vendorsData?.vendors && vendorsData.vendors.length > 0 ? (
              vendorsData.vendors
                .slice(0, 5)
                .map((vendor, index) => {
                  // Get real performance data
                  const performance = performanceMap.get(vendor.id);
                  const spendAmount: number = performance?.total_spend || 0;
                  const orderCount: number = performance?.total_orders || 0;
                  const rating: number = performance?.overall_rating || 0;
                  
                  return (
                    <div
                      key={vendor.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200 hover:shadow-lg hover:border-amber-300 transition-all"
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 font-bold text-sm font-outfit flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#1A1A1A] text-sm font-outfit mb-1 truncate">{vendor.vendor_name}</div>
                          <div className="text-xs text-gray-600 font-outfit truncate">
                            {vendor.organisation || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-5 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-[#1A1A1A] font-outfit">
                            ${spendAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600 font-outfit">
                            {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                          </div>
                        </div>
                        {rating > 0 ? (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-[#1A1A1A] font-outfit">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 font-outfit">No rating yet</div>
                        )}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8 text-gray-500 font-outfit">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No vendor data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/50 to-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="mb-6 pb-4 border-b border-purple-200">
            <div className="flex items-center space-x-2 mb-1">
              <div className="rounded-lg bg-purple-100 p-2">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">AI Vendor Risk Assessment</h3>
              <Badge className="bg-purple-100 text-purple-800 text-xs font-outfit">Real-time Monitoring</Badge>
            </div>
            <p className="text-sm text-gray-600 font-outfit">
              AI monitors public data sources for financial distress and reputational risks
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white border-2 border-red-200 rounded-xl hover:bg-red-50/50 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="rounded-full bg-red-100 p-2.5 flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900 font-outfit mb-1">High Risk Alert</p>
                  <p className="text-xs text-red-700 font-outfit leading-relaxed">
                    TechCorp Inc: Recent news indicates potential financial instability
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 font-outfit flex-shrink-0">
                Review
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border-2 border-amber-200 rounded-xl hover:bg-amber-50/50 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="rounded-full bg-amber-100 p-2.5 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900 font-outfit mb-1">Medium Risk</p>
                  <p className="text-xs text-amber-700 font-outfit leading-relaxed">
                    Dell Technologies: Industry volatility detected - monitoring recommended
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-600 hover:bg-amber-100 font-outfit flex-shrink-0">
                Monitor
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50/50 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="rounded-full bg-emerald-100 p-2.5 flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-900 font-outfit mb-1">Low Risk</p>
                  <p className="text-xs text-emerald-700 font-outfit leading-relaxed">
                    Microsoft Corporation: Strong financial position, no reputational concerns
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-600 hover:bg-emerald-100 font-outfit flex-shrink-0">
                Approved
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="mb-6 pb-4 border-b border-blue-200 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="rounded-lg bg-blue-100 p-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Vendor Qualification</h3>
              </div>
              <p className="text-sm text-gray-600 font-outfit">Vendor credentials, certifications, and qualification scores</p>
            </div>
            {canApprove && (
              <Button
                size="sm"
                variant="outline"
                className="border-[#161950] text-[#161950] hover:bg-[#161950]/10 font-outfit"
                onClick={() => {
                  if (vendorsData?.vendors && vendorsData.vendors.length > 0) {
                    setQualificationVendor({ id: vendorsData.vendors[0].id, name: vendorsData.vendors[0].vendor_name });
                  }
                }}
              >
                <Settings className="h-4 w-4 mr-1" />
                Manage
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {isLoadingQualifications ? (
              <div className="text-center py-8 text-gray-500 font-outfit">Loading qualifications...</div>
            ) : vendorsData?.vendors && vendorsData.vendors.length > 0 ? (
              vendorsData.vendors.map((vendor) => {
                const qualification = qualificationsMap.get(vendor.id);
                if (!qualification) {
                  return (
                    <div key={vendor.id} className="p-4 bg-white rounded-xl border border-blue-200 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-[#1A1A1A] text-sm font-outfit">{vendor.vendor_name}</div>
                        {canApprove && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#161950] text-[#161950] hover:bg-[#161950]/10 font-outfit text-xs h-7"
                            onClick={() => setQualificationVendor({ id: vendor.id, name: vendor.vendor_name })}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-outfit">No qualification data yet</p>
                    </div>
                  );
                }
                const financialStability = qualification.financial_stability?.toLowerCase() as 'excellent' | 'good' | 'fair' | 'poor' | undefined;
                return (
                  <div key={vendor.id} className="p-4 bg-white rounded-xl border border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[#1A1A1A] text-sm font-outfit">{vendor.vendor_name}</div>
                      <div className="flex items-center gap-2">
                        {qualification.qualification_score !== null && (
                          <>
                            <div className="text-lg font-bold text-blue-600 font-outfit">{qualification.qualification_score}</div>
                            <span className="text-xs text-gray-500 font-outfit">/100</span>
                          </>
                        )}
                        {canApprove && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#161950] text-[#161950] hover:bg-[#161950]/10 font-outfit text-xs h-7"
                            onClick={() => setQualificationVendor({ id: vendor.id, name: vendor.vendor_name })}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {qualification.financial_stability && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-outfit">Financial Stability</span>
                          <Badge className={`${
                            financialStability === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                            financialStability === 'good' ? 'bg-blue-100 text-blue-700' : 
                            financialStability === 'fair' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          } text-xs font-outfit`}>
                            {qualification.financial_stability.charAt(0).toUpperCase() + qualification.financial_stability.slice(1)}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-outfit">Credentials Verified</span>
                        {qualification.credentials_verified ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {qualification.certifications && qualification.certifications.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-outfit">Certifications</span>
                          <span className="text-[#1A1A1A] font-medium font-outfit">{qualification.certifications.join(', ')}</span>
                        </div>
                      )}
                      {qualification.risk_level && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-outfit">Risk Level</span>
                          <Badge className={`${
                            qualification.risk_level === 'low' ? 'bg-emerald-100 text-emerald-700' :
                            qualification.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          } text-xs font-outfit`}>
                            {qualification.risk_level.charAt(0).toUpperCase() + qualification.risk_level.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 font-outfit">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No vendor qualification data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50/50 to-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
          <div className="mb-6 pb-4 border-b border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <div className="rounded-lg bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Vendor Performance</h3>
            </div>
            <p className="text-sm text-gray-600 font-outfit">Performance metrics, ratings, and delivery history (Real data from orders and invoices)</p>
          </div>
          <div className="space-y-4">
            {vendorsData?.vendors && vendorsData.vendors.length > 0 ? (
              vendorsData.vendors.slice(0, 3).map((vendor) => {
                const performance = performanceMap.get(vendor.id);
                if (!performance || performance.total_orders === 0) {
                  return (
                    <div key={vendor.id} className="p-4 bg-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-[#1A1A1A] text-sm font-outfit">{vendor.vendor_name}</div>
                      </div>
                      <p className="text-xs text-gray-500 font-outfit">No performance data yet (no orders placed)</p>
                    </div>
                  );
                }
                const trendColor = performance.performance_trend === 'improving' ? 'bg-emerald-100 text-emerald-700' :
                                  performance.performance_trend === 'stable' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
                return (
                  <div key={vendor.id} className="p-4 bg-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[#1A1A1A] text-sm font-outfit">{vendor.vendor_name}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-[#1A1A1A] font-outfit">{performance.overall_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-outfit">Total Orders</span>
                        <span className="text-[#1A1A1A] font-medium font-outfit">{performance.total_orders}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-outfit">Total Spend</span>
                        <span className="text-[#1A1A1A] font-medium font-outfit">${performance.total_spend.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-outfit">On-Time Delivery</span>
                        <span className="text-emerald-600 font-semibold font-outfit">{performance.on_time_delivery_rate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-outfit">Avg Delivery Time</span>
                        <span className="text-[#1A1A1A] font-medium font-outfit">{performance.average_delivery_time.toFixed(1)} days</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-outfit">Performance Trend</span>
                        <Badge className={`${trendColor} text-xs font-outfit capitalize`}>
                          {performance.performance_trend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 font-outfit">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No vendor performance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddVendorModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!isCreating) {
            setIsModalOpen(open);
          }
        }}
        onSubmit={handleCreateVendor}
        isLoading={isCreating}
        existingEmails={vendorsData?.vendors?.map(v => v.email) || []}
      />

      <ViewVendorModal
        open={!!viewingVendor}
        onOpenChange={(open) => {
          if (!open) setViewingVendor(null);
        }}
        vendor={viewingVendor}
      />

      <EditVendorModal
        open={!!editingVendor}
        onOpenChange={(open) => {
          if (!open) setEditingVendor(null);
        }}
        vendor={editingVendor}
        onSubmit={handleUpdateVendor}
        isLoading={isUpdating}
      />

      <AlertDialog open={!!deletingVendorId} onOpenChange={(open) => {
        if (!open) setDeletingVendorId(null);
      }}>
        <AlertDialogContent className="font-outfit">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this supplier? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVendor}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {qualificationVendor && (
        <VendorQualificationModal
          open={!!qualificationVendor}
          onOpenChange={(open) => {
            if (!open) setQualificationVendor(null);
          }}
          vendorId={qualificationVendor.id}
          vendorName={qualificationVendor.name}
          existingQualification={qualificationsMap.get(qualificationVendor.id) || null}
          onSubmit={handleSaveQualification}
          isLoading={false}
        />
      )}
    </div>
  );
}

