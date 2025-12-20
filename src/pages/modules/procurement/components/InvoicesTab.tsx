import { useState } from 'react';
import { Plus, Upload, CheckCircle2, AlertTriangle, FileSearch, Eye, CheckCircle, Package, FileCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VendorInvoice } from '../types';
import { getStatusBadge } from '../utils';
import { UploadInvoiceModal } from '../modals';
import { useProcurement } from '@/hooks/procurement';

interface InvoicesTabProps {
  invoices: VendorInvoice[];
  isLoading?: boolean;
}

export function InvoicesTab({ invoices, isLoading = false }: InvoicesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createInvoice, isCreatingInvoice } = useProcurement();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-2">
        <div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A] font-outfit mb-1">Vendor Invoice Management</h2>
          <p className="text-sm text-gray-600 font-outfit">Three-way matching: PO, Invoice, and Goods Receipt</p>
        </div>
        <Button
          className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Invoice
        </Button>
      </div>

      {invoices.length > 0 && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)] font-outfit hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Auto-Approved</span>
              <div className="rounded-lg bg-[#161950]/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-[#161950]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                {invoices.filter(inv => inv.matchingStatus === 'perfect_match' && inv.status === 'approved').length}
              </span>
              <span className="text-sm font-medium text-gray-600 font-outfit">Perfect matches</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)] font-outfit hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Flagged for Review</span>
              <div className="rounded-lg bg-[#161950]/10 p-2.5">
                <AlertTriangle className="h-5 w-5 text-[#161950]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                {invoices.filter(inv => inv.matchingStatus === 'exception' || inv.matchingStatus === 'no_match').length}
              </span>
              <span className="text-sm font-medium text-gray-600 font-outfit">Exceptions</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)] font-outfit hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.5)] transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Fraud Detection</span>
              <div className="rounded-lg bg-[#161950]/10 p-2.5">
                <FileSearch className="h-5 w-5 text-[#161950]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#1A1A1A] font-outfit">
                {invoices.filter(inv => inv.matchingStatus === 'exception').length}
              </span>
              <span className="text-sm font-medium text-gray-600 font-outfit">Potential issues</span>
            </div>
          </div>
        </section>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">AI-Powered Invoice Upload</h3>
          <p className="text-sm text-gray-600 font-outfit">Upload vendor invoice for automatic matching and fraud detection</p>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-gray-400 transition-colors">
          <div className="flex items-center justify-center mb-6">
            <Upload className="h-10 w-10 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-[#1A1A1A] mb-6 font-outfit">Upload vendor invoice</p>
          <p className="text-xs text-gray-500 mb-8 font-outfit leading-relaxed max-w-md mx-auto">
            System will match against PO, extract key data, and detect fraud patterns
          </p>
          <Button className="bg-[#161950] hover:bg-[#1E2B5B] text-white font-outfit h-11 px-6">
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-6 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-emerald-200">
          <div className="flex items-center space-x-2 mb-1">
            <Package className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit">Goods Receipt Notes (GRN)</h3>
          </div>
          <p className="text-sm text-gray-600 font-outfit">Three-way matching: Purchase Order, Invoice, and Goods Receipt</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {invoices.map((invoice) => {
            if (!invoice.grnAmount) return null;
            const matchStatus = invoice.poAmount === invoice.amount && invoice.grnAmount === invoice.amount;
            return (
              <div key={invoice.id} className="p-4 bg-white rounded-xl border border-emerald-200 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-[#1A1A1A] text-sm font-outfit">GRN-{invoice.id}</div>
                  {matchStatus ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-outfit">PO Amount:</span>
                    <span className="font-medium text-[#1A1A1A] font-outfit">${invoice.poAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-outfit">Invoice Amount:</span>
                    <span className="font-medium text-[#1A1A1A] font-outfit">${invoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-outfit">GRN Amount:</span>
                    <span className="font-medium text-[#1A1A1A] font-outfit">${invoice.grnAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <Badge className={matchStatus ? 'bg-emerald-100 text-emerald-700 text-xs font-outfit' : 'bg-amber-100 text-amber-700 text-xs font-outfit'}>
                      {matchStatus ? 'Perfect Match' : 'Variance Detected'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {invoices.every(inv => !inv.grnAmount) && (
          <div className="text-center py-8 text-gray-500 font-outfit">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No GRN records available. Create GRN when goods are received.</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-[0_24px_48px_-24px_rgba(15,23,42,0.3)] font-outfit">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-[#1A1A1A] font-outfit mb-1">Vendor Invoices</h3>
          <p className="text-sm text-gray-600 font-outfit">Three-way matching status and approval workflow</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-outfit">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Invoice #</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Vendor</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">PO Number</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Amount</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Matching Status</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Status</th>
                <th className="text-left py-4 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500 font-outfit">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const statusBadge = getStatusBadge(invoice.status);
                const matchingBadge = invoice.matchingStatus === 'perfect_match'
                  ? { label: 'Perfect Match', className: 'bg-emerald-50 text-emerald-700' }
                  : invoice.matchingStatus === 'partial_match'
                  ? { label: 'Partial Match', className: 'bg-amber-50 text-amber-700' }
                  : invoice.matchingStatus === 'exception'
                  ? { label: 'Exception', className: 'bg-rose-50 text-rose-700' }
                  : { label: 'No Match', className: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#1A1A1A] font-outfit mb-1">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500 font-outfit">{invoice.invoiceDate}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#1A1A1A] font-outfit">{invoice.vendor}</td>
                    <td className="py-4 px-4 text-gray-700 font-outfit">{invoice.poNumber}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-[#1A1A1A] font-outfit">${invoice.amount.toFixed(2)}</span>
                      {invoice.variance !== undefined && invoice.variance !== 0 && (
                        <div className={`text-xs font-outfit mt-1 ${invoice.variance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {invoice.variance > 0 ? '+' : ''}${invoice.variance.toFixed(2)} variance
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${matchingBadge.className} font-outfit`}>{matchingBadge.label}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${statusBadge.className} font-outfit`}>{statusBadge.label}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-gray-200 hover:bg-gray-50 font-outfit h-8 w-8 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {invoice.matchingStatus === 'perfect_match' && invoice.status === 'matched' && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-outfit h-8 w-8 p-0">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <UploadInvoiceModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={async (data) => {
          try {
            await createInvoice({
              po_id: data.poId,
              vendor_id: data.vendorId,
              invoice_number: data.invoiceNumber,
              vendor_name: data.vendorName,
              amount: data.amount,
              invoice_date: data.invoiceDate,
              due_date: data.dueDate,
              invoice_file_url: data.invoiceFileUrl,
            });
            setIsModalOpen(false);
          } catch (error) {
            console.error('Error creating invoice:', error);
          }
        }}
      />
    </div>
  );
}

