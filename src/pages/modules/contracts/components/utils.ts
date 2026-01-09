export const getStatusColor = (status: string) => {
  switch (status) {
    case 'awaiting-review':
      return 'bg-yellow-100 text-yellow-800';
    case 'in-legal-review':
      return 'bg-blue-100 text-blue-800';
    case 'exceptions-approved':
      return 'bg-green-100 text-green-800';
    case 'negotiating':
      return 'bg-purple-100 text-purple-800';
    case 'executed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'high':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getClauseRiskColor = (risk: string) => {
  switch (risk) {
    case 'green':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'amber':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'red':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

