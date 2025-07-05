// Currency formatting utility
function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? parseInt(amount, 10) : amount;
  
  if (isNaN(value)) {
    return '0';
  }
  
  // Format large numbers with K, M, B suffixes
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 10000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  
  // Add commas to thousands
  return value.toLocaleString();
}

interface CurrencyDisplayProps {
  amount: number | string;
  showIcon?: boolean;
  className?: string;
}

export function CurrencyDisplay({ amount, showIcon = true, className = '' }: CurrencyDisplayProps) {
  const formattedAmount = formatCurrency(amount);
  
  return (
    <div className={`currency-display ${className}`}>
      {showIcon && <span className="currency-icon">💰</span>}
      <span className="currency-amount">{formattedAmount}</span>
      <span className="currency-type">gold</span>
    </div>
  );
}

interface CurrencyChangeProps {
  amount: number | string;
  isPositive?: boolean;
  className?: string;
}

export function CurrencyChange({ amount, isPositive, className = '' }: CurrencyChangeProps) {
  const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  const positive = isPositive !== undefined ? isPositive : numAmount >= 0;
  const formattedAmount = formatCurrency(Math.abs(numAmount));
  
  return (
    <div className={`currency-change ${positive ? 'positive' : 'negative'} ${className}`}>
      <span className="change-symbol">{positive ? '+' : '-'}</span>
      <span className="change-amount">{formattedAmount}</span>
      <span className="currency-type">gold</span>
    </div>
  );
}