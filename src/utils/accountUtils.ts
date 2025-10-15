export const getClientTypeColor = (type: string) => {
  switch (type) {
    case 'tier_1':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'tier_2':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'tier_3':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'tier_4':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getClientTypeLabel = (type: string) => {
  switch (type) {
    case 'tier_1':
      return 'Tier 1';
    case 'tier_2':
      return 'Tier 2';
    case 'tier_3':
      return 'Tier 3';
    case 'tier_4':
      return 'Tier 4';
    default:
      return type;
  }
};

export const getRiskBadge = (riskLevel?: string) => {
  switch (riskLevel) {
    case 'low_risk':
      return { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300', label: 'Low Risk' };
    case 'medium_risk':
      return { color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-300', label: 'Medium Risk' };
    case 'high_risk':
      return { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300', label: 'High Risk' };
    default:
      return { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300', label: 'Unknown' };
  }
};

export const getRiskColor = (riskLevel?: string): string => {
  switch (riskLevel) {
    case 'low_risk':
      return '#10b981';
    case 'medium_risk':
      return '#f59e0b';
    case 'high_risk':
      return '#ef4444';
    default:
      return '#9ca3af';
  }
};
