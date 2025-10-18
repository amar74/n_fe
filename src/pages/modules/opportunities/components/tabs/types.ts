export interface TabProps {
  opportunity: any;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface SectionHeaderProps {
  title: string;
  buttonText?: string;
  onButtonClick?: () => void;
}