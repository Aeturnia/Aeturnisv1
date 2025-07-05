import React from 'react';
import { formatCurrency } from '../utils/currency';

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