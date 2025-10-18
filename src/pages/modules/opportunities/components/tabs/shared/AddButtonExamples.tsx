// This file demonstrates how to use AddButton with different functionalities
import { AddButton } from './index';

// Example 1: Add Document (OverviewTab)
const handleAddDocument = () => {
  // Open file upload modal
  console.log('Opening document upload modal');
  // Could also navigate to upload page: navigate('/documents/upload');
};

// Example 2: Add Stakeholder (ClientStakeholderTab)
const handleAddStakeholder = () => {
  // Open stakeholder form modal
  console.log('Opening stakeholder form modal');
  // Could also navigate to form: navigate('/stakeholders/new');
};

// Example 3: Add Team Member (TeamReferencesTab)
const handleAddTeamMember = () => {
  // Open team member selection modal
  console.log('Opening team member selection modal');
  // Could also navigate to team page: navigate('/team/add');
};

// Example 4: Add Budget Category (FinancialSummaryTab)
const handleAddBudgetCategory = () => {
  // Open budget category form
  console.log('Opening budget category form');
  // Could also navigate to budget page: navigate('/budget/categories/new');
};

// Example 5: Add Risk Assessment (LegalRisksTab)
const handleAddRiskAssessment = () => {
  // Open risk assessment form
  console.log('Opening risk assessment form');
  // Could also navigate to risk page: navigate('/risks/new');
};

// Example 6: Add Competitor (CompetitionStrategyTab)
const handleAddCompetitor = () => {
  // Open competitor analysis form
  console.log('Opening competitor analysis form');
  // Could also navigate to competitor page: navigate('/competitors/new');
};

// Example 7: Add Project Phase (DeliveryModelTab)
const handleAddProjectPhase = () => {
  // Open project phase form
  console.log('Opening project phase form');
  // Could also navigate to phases page: navigate('/phases/new');
};

// Usage Examples:
export const AddButtonUsageExamples = () => {
  return (
    <div className="space-y-4">
      {/* Basic usage with different text */}
      <AddButton onClick={handleAddDocument}>Add Documents</AddButton>
      <AddButton onClick={handleAddStakeholder}>Add Stakeholder</AddButton>
      <AddButton onClick={handleAddTeamMember}>Add Team Member</AddButton>
      
      {/* With loading state */}
      <AddButton onClick={handleAddBudgetCategory} loading={true}>
        Add Budget Category
      </AddButton>
      
      {/* With disabled state */}
      <AddButton onClick={handleAddRiskAssessment} disabled={true}>
        Add Risk Assessment
      </AddButton>
      
      {/* Default text */}
      <AddButton onClick={handleAddCompetitor} />
      
      {/* Custom styling */}
      <AddButton 
        onClick={handleAddProjectPhase} 
        className="bg-green-600 hover:bg-green-700"
      >
        Add Project Phase
      </AddButton>
    </div>
  );
};

// Common patterns for different functionalities:

// 1. Modal-based additions
const openModal = (modalType: string) => {
  // Dispatch action to open modal
  // dispatch(openModal({ type: modalType }));
};

// 2. Navigation-based additions
const navigateToForm = (path: string) => {
  // Navigate to form page
  // navigate(path);
};

// 3. API-based additions
const addItem = async (itemData: any) => {
  try {
    // Show loading state
    // setLoading(true);
    
    // Call API
    // const response = await api.addItem(itemData);
    
    // Handle success
    // toast.success('Item added successfully');
    
    // Refresh data
    // refetch();
  } catch (error) {
    // Handle error
    // toast.error('Failed to add item');
  } finally {
    // Hide loading state
    // setLoading(false);
  }
};

// 4. Form-based additions
const openForm = (formType: string) => {
  // Open form with specific type
  // setFormType(formType);
  // setShowForm(true);
};