import { memo } from 'react';
import { CardProps } from '../types';

const Card = memo(({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;