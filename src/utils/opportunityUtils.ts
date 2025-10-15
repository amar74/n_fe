export const parseProjectValue = (value: string): number | undefined => {
  if (!value || value== '') return undefined;
  
  let cleanValue = value.replace(/[$,]/g, '').trim();
  
  if (cleanValue.includes('-')) {
    cleanValue = cleanValue.split('-')[0];
  } else if (cleanValue.includes('+')) {
    cleanValue = cleanValue.replace('+', '');
  }
  
  let multiplier = 1;
  if (cleanValue.toLowerCase().includes('k')) {
    multiplier = 1000;
    cleanValue = cleanValue.toLowerCase().replace('k', '');
  } else if (cleanValue.toLowerCase().includes('m')) {
    multiplier = 1000000;
    cleanValue = cleanValue.toLowerCase().replace('m', '');
  } else if (cleanValue.toLowerCase().includes('b')) {
    multiplier = 1000000000;
    cleanValue = cleanValue.toLowerCase().replace('b', '');
  }
  
  const numericValue = parseFloat(cleanValue);
  
  if (isNaN(numericValue)) {
    return undefined;
  }
  
  return numericValue * multiplier;
};

export const formatProjectValue = (value: number): string => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
};
