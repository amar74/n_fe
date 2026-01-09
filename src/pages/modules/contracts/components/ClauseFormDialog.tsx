import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gavel, Edit3, Plus, Save } from 'lucide-react';
import type { ClauseLibraryItem } from '@/services/api/clauseLibraryApi';
import type { ClauseCategory } from '@/services/api/clauseLibraryApi';

interface ClauseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    category: string;
    clause_text: string;
    acceptable_alternatives: string[];
    fallback_positions: string[];
    risk_level: 'preferred' | 'acceptable' | 'fallback';
  }) => Promise<void>;
  editingClause?: ClauseLibraryItem | null;
  categories: ClauseCategory[];
  isSubmitting?: boolean;
}

export function ClauseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editingClause,
  categories,
  isSubmitting = false,
}: ClauseFormDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    clause_text: '',
    acceptable_alternatives: '',
    fallback_positions: '',
    risk_level: 'preferred' as 'preferred' | 'acceptable' | 'fallback',
  });

  useEffect(() => {
    if (editingClause) {
      setFormData({
        title: editingClause.title,
        category: editingClause.category,
        clause_text: editingClause.clause_text,
        acceptable_alternatives: editingClause.acceptable_alternatives?.join('\n') || '',
        fallback_positions: editingClause.fallback_positions?.join('\n') || '',
        risk_level: editingClause.risk_level,
      });
    } else {
      setFormData({
        title: '',
        category: '',
        clause_text: '',
        acceptable_alternatives: '',
        fallback_positions: '',
        risk_level: 'preferred',
      });
    }
  }, [editingClause, open]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.clause_text) {
      return;
    }

    await onSubmit({
      title: formData.title,
      category: formData.category,
      clause_text: formData.clause_text,
      acceptable_alternatives: formData.acceptable_alternatives
        ? formData.acceptable_alternatives.split('\n').filter(line => line.trim())
        : [],
      fallback_positions: formData.fallback_positions
        ? formData.fallback_positions.split('\n').filter(line => line.trim())
        : [],
      risk_level: formData.risk_level,
    });
  };

  const handleClose = () => {
    setFormData({
      title: '',
      category: '',
      clause_text: '',
      acceptable_alternatives: '',
      fallback_positions: '',
      risk_level: 'preferred',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-outfit">
        <DialogHeader>
          <DialogTitle className="text-[#1A1A1A] text-xl font-semibold font-outfit flex items-center gap-2">
            {editingClause ? (
              <>
                <Edit3 className="h-5 w-5 text-[#161950]" />
                Edit Clause
              </>
            ) : (
              <>
                <Gavel className="h-5 w-5 text-[#161950]" />
                Add New Clause to Library
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-[#667085] font-outfit">
            {editingClause
              ? 'Update clause details, alternatives, and fallback positions'
              : 'Create a new standard clause with preferred language, alternatives, and fallback positions'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="clause-title" className="text-sm font-medium text-[#1A1A1A] font-outfit">
                Clause Title *
              </Label>
              <Input
                id="clause-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
                placeholder="e.g., Limitation of Liability"
              />
            </div>
            <div>
              <Label htmlFor="clause-category" className="text-sm font-medium text-[#1A1A1A] font-outfit">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Risk Management">Risk Management</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Intellectual Property">Intellectual Property</SelectItem>
                      <SelectItem value="Termination">Termination</SelectItem>
                      <SelectItem value="Confidentiality">Confidentiality</SelectItem>
                      <SelectItem value="Governing Law">Governing Law</SelectItem>
                      <SelectItem value="Payment Terms">Payment Terms</SelectItem>
                      <SelectItem value="Indemnification">Indemnification</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="clause-text" className="text-sm font-medium text-[#1A1A1A] font-outfit">
              Preferred Clause Text *
            </Label>
            <Textarea
              id="clause-text"
              value={formData.clause_text}
              onChange={(e) => setFormData({ ...formData, clause_text: e.target.value })}
              className="mt-2 min-h-[120px] font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
              placeholder="Enter the preferred clause language..."
            />
            <p className="text-xs text-[#667085] font-outfit mt-1">
              This is the preferred language that should be used in contracts
            </p>
          </div>

          <div>
            <Label htmlFor="acceptable-alternatives" className="text-sm font-medium text-[#1A1A1A] font-outfit">
              Acceptable Alternatives
            </Label>
            <Textarea
              id="acceptable-alternatives"
              value={formData.acceptable_alternatives}
              onChange={(e) => setFormData({ ...formData, acceptable_alternatives: e.target.value })}
              className="mt-2 min-h-[100px] font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
              placeholder="Enter one alternative per line..."
            />
            <p className="text-xs text-[#667085] font-outfit mt-1">
              List acceptable alternative wordings (one per line)
            </p>
          </div>

          <div>
            <Label htmlFor="fallback-positions" className="text-sm font-medium text-[#1A1A1A] font-outfit">
              Fallback Positions
            </Label>
            <Textarea
              id="fallback-positions"
              value={formData.fallback_positions}
              onChange={(e) => setFormData({ ...formData, fallback_positions: e.target.value })}
              className="mt-2 min-h-[100px] font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
              placeholder="Enter one fallback position per line..."
            />
            <p className="text-xs text-[#667085] font-outfit mt-1">
              List fallback positions if preferred language cannot be used (one per line)
            </p>
          </div>

          <div>
            <Label htmlFor="risk-level" className="text-sm font-medium text-[#1A1A1A] font-outfit">
              Risk Level
            </Label>
            <Select
              value={formData.risk_level}
              onValueChange={(value: 'preferred' | 'acceptable' | 'fallback') =>
                setFormData({ ...formData, risk_level: value })
              }
            >
              <SelectTrigger className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preferred">Preferred</SelectItem>
                <SelectItem value="acceptable">Acceptable</SelectItem>
                <SelectItem value="fallback">Fallback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-11 px-5 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] rounded-lg font-outfit"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || !formData.category || !formData.clause_text}
            className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg shadow-sm font-outfit"
          >
            {isSubmitting ? (
              'Saving...'
            ) : editingClause ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Clause
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Clause
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

