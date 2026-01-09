import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  BookOpen,
  Brain,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  Gavel,
  Edit3,
  XCircle,
  Download,
} from 'lucide-react';
import type { ClauseLibraryItem } from '@/services/api/clauseLibraryApi';
import type { ClauseCategory } from '@/services/api/clauseLibraryApi';
import { ClauseFormDialog } from './ClauseFormDialog';

interface ClauseLibraryTabProps {
  clauseLibrary: ClauseLibraryItem[];
  isLoadingClauses: boolean;
  categories: ClauseCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  clauseSearchQuery: string;
  onSearchChange: (query: string) => void;
  onEditClause: (clause: ClauseLibraryItem) => void;
  onDeleteClause: (id: string) => Promise<void>;
  onCreateClause: (data: {
    title: string;
    category: string;
    clause_text: string;
    acceptable_alternatives: string[];
    fallback_positions: string[];
    risk_level: 'preferred' | 'acceptable' | 'fallback';
  }) => Promise<void>;
  onUpdateClause: (id: string, data: {
    title: string;
    category: string;
    clause_text: string;
    acceptable_alternatives: string[];
    fallback_positions: string[];
    risk_level: 'preferred' | 'acceptable' | 'fallback';
  }) => Promise<void>;
  editingClause: ClauseLibraryItem | null;
  isCreating: boolean;
  isUpdating: boolean;
}

export function ClauseLibraryTab({
  clauseLibrary,
  isLoadingClauses,
  categories,
  selectedCategory,
  onCategoryChange,
  clauseSearchQuery,
  onSearchChange,
  onEditClause,
  onDeleteClause,
  onCreateClause,
  onUpdateClause,
  editingClause,
  isCreating,
  isUpdating,
}: ClauseLibraryTabProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = (clause: ClauseLibraryItem) => {
    onEditClause(clause);
    setShowEditDialog(true);
  };

  const handleCreateSubmit = async (data: {
    title: string;
    category: string;
    clause_text: string;
    acceptable_alternatives: string[];
    fallback_positions: string[];
    risk_level: 'preferred' | 'acceptable' | 'fallback';
  }) => {
    await onCreateClause(data);
    setShowAddDialog(false);
  };

  const handleUpdateSubmit = async (data: {
    title: string;
    category: string;
    clause_text: string;
    acceptable_alternatives: string[];
    fallback_positions: string[];
    risk_level: 'preferred' | 'acceptable' | 'fallback';
  }) => {
    if (editingClause) {
      await onUpdateClause(editingClause.id, data);
      setShowEditDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[#1A1A1A] text-3xl font-semibold font-outfit leading-loose">
              Clause Library
            </h2>
            <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
              <Brain className="h-3 w-3 mr-1.5" />
              AI Enhanced
            </Badge>
          </div>
          <p className="text-lg text-[#667085] font-outfit">
            Pre-approved standard clauses with AI-generated alternatives and continuous learning
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg flex items-center gap-2.5 shadow-sm font-outfit"
        >
          <Plus className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-medium font-outfit leading-normal">Add New Clause</span>
        </Button>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clause-search" className="text-sm font-medium text-[#1A1A1A] font-outfit">Search Clauses</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#667085]" />
              <Input
                id="clause-search"
                value={clauseSearchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]"
                placeholder="Search by title or text..."
              />
            </div>
          </div>
          <div>
            <Label htmlFor="clause-category-filter" className="text-sm font-medium text-[#1A1A1A] font-outfit">Filter by Category</Label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="mt-2 h-11 font-outfit border-[#E5E7EB] focus:border-[#161950] focus:ring-1 focus:ring-[#161950]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex justify-start items-start gap-6">
          <div className="flex-1 flex flex-col gap-1">
            <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-[#161950]" />
              AI-Powered Features
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="h-5 w-5 text-[#161950]" />
              <h5 className="font-semibold text-[#1A1A1A] font-outfit">Alternative Wording Generation</h5>
            </div>
            <p className="text-sm text-[#667085] font-outfit">
              AI automatically suggests pre-approved alternative language for high-risk clauses from your legal playbook
            </p>
          </div>
          <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-[#161950]" />
              <h5 className="font-semibold text-[#1A1A1A] font-outfit">Learning Library</h5>
            </div>
            <p className="text-sm text-[#667085] font-outfit">
              Library continuously learns from successful negotiations, identifying novel clause variations for addition
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
          <div className="flex justify-start items-start gap-6">
            <div className="flex-1 flex flex-col gap-1">
              <h2 className="text-[#1A1A1A] text-lg font-semibold font-outfit leading-7 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#161950]" />
                Categories
              </h2>
              <p className="text-xs text-[#667085] font-outfit mt-1">
                {categories.length} categories available
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => onCategoryChange('all')}
              className={`w-full justify-start h-11 rounded-lg font-outfit ${
                selectedCategory === 'all'
                  ? 'bg-[#161950] text-white hover:bg-[#1E2B5B]'
                  : 'border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] hover:text-[#1A1A1A]'
              }`}
            >
              All Categories
            </Button>
            {categories.length > 0 ? (
              categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  onClick={() => onCategoryChange(category.name)}
                  className={`w-full justify-start h-11 rounded-lg font-outfit ${
                    selectedCategory === category.name
                      ? 'bg-[#161950] text-white hover:bg-[#1E2B5B]'
                      : 'border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] hover:text-[#1A1A1A]'
                  }`}
                >
                  {category.name}
                </Button>
              ))
            ) : (
              <p className="text-sm text-[#667085] font-outfit text-center py-4">
                No categories found
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {isLoadingClauses ? (
            <div className="p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161950] mx-auto mb-4"></div>
              <p className="text-[#667085] font-outfit">Loading clauses...</p>
            </div>
          ) : clauseLibrary.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border-2 border-dashed border-[#E5E7EB] text-center">
              <BookOpen className="h-12 w-12 text-[#D0D5DD] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2 font-outfit">
                No Clauses Found
              </h3>
              <p className="text-[#667085] mb-4 font-outfit">
                {clauseSearchQuery || selectedCategory !== 'all'
                  ? 'No clauses match your search criteria'
                  : 'Get started by adding your first clause to the library'}
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="h-11 px-5 bg-[#161950] hover:bg-[#1E2B5B] text-white rounded-lg font-outfit"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Clause
              </Button>
            </div>
          ) : (
            clauseLibrary.map((clause) => (
              <div key={clause.id} className="p-6 bg-white rounded-2xl border border-[#E5E7EB] flex flex-col gap-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] font-outfit flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-[#161950]" />
                    {clause.title}
                  </h3>
                  <Badge variant="outline" className="bg-[#F9FAFB] text-[#667085] border-[#E5E7EB] px-2.5 py-1 font-outfit">
                    {clause.category}
                  </Badge>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-[#1A1A1A] font-outfit">Preferred Language:</h4>
                    <div className="bg-[#ECFDF3] p-4 rounded-2xl border border-[#039855]/20 text-sm text-[#039855] font-outfit">
                      {clause.clause_text}
                    </div>
                  </div>
                  {clause.acceptable_alternatives && clause.acceptable_alternatives.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[#1A1A1A] font-outfit">Acceptable Alternatives:</h4>
                      <ul className="space-y-2">
                        {clause.acceptable_alternatives.map((alt, index) => (
                          <li
                            key={index}
                            className="text-sm text-[#1A1A1A] bg-[#FFFAEB] p-3 rounded-2xl border border-[#DC6803]/20 font-outfit"
                          >
                            • {alt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {clause.fallback_positions && clause.fallback_positions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-[#1A1A1A] font-outfit">Fallback Positions:</h4>
                      <ul className="space-y-2">
                        {clause.fallback_positions.map((fallback, index) => (
                          <li
                            key={index}
                            className="text-sm text-[#1A1A1A] bg-[#FEF3F2] p-3 rounded-2xl border border-[#D92D20]/20 font-outfit"
                          >
                            • {fallback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-[#161950]" />
                      <h5 className="text-sm font-semibold text-[#1A1A1A] font-outfit">AI Alternative Generator</h5>
                    </div>
                    <p className="text-xs text-[#667085] mb-3 font-outfit">
                      AI can generate additional alternatives based on your legal playbook and recent successful negotiations
                    </p>
                    <Button size="sm" variant="outline" className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-white rounded-lg font-outfit">
                      <Lightbulb className="h-3 w-3 mr-1.5" />
                      Generate AI Alternatives
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(clause)}
                      className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] rounded-lg font-outfit"
                    >
                      <Edit3 className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteClause(clause.id)}
                      className="h-9 px-4 border-[#D92D20] text-[#D92D20] hover:bg-[#FEF3F2] rounded-lg font-outfit"
                    >
                      <XCircle className="h-3 w-3 mr-1.5" />
                      Delete
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 px-4 border-[#E5E7EB] text-[#667085] hover:bg-[#F9FAFB] rounded-lg font-outfit">
                      <Download className="h-3 w-3 mr-1.5" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ClauseFormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleCreateSubmit}
        categories={categories}
        isSubmitting={isCreating}
      />

      <ClauseFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleUpdateSubmit}
        editingClause={editingClause}
        categories={categories}
        isSubmitting={isUpdating}
      />
    </div>
  );
}

