interface PriceFormatterProps {
  price: number;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

export default function PriceFormatter({
  price,
  currency = 'USD',
  minimumFractionDigits = 0,
  maximumFractionDigits = 0,
  className = '',
}: PriceFormatterProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });
  
  // Format based on price range
  let formattedPrice = formatter.format(price);
  
  // For prices over 1 million, show in millions
  if (price >= 1000000) {
    const inMillions = price / 1000000;
    formattedPrice = `$${inMillions.toFixed(inMillions % 1 === 0 ? 0 : 1)}M`;
  }
  
  return <span className={className}>{formattedPrice}</span>;
}
