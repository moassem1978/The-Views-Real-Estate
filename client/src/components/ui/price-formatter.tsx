interface PriceFormatterProps {
  price: number;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  className?: string;
}

export default function PriceFormatter({
  price,
  currency = 'EGP',
  minimumFractionDigits = 0,
  maximumFractionDigits = 0,
  className = '',
}: PriceFormatterProps) {
  // For Egyptian Pounds, use custom formatting
  if (currency === 'EGP') {
    let formattedPrice = price.toLocaleString();
    
    // For prices over 1 million, show in millions
    if (price >= 1000000) {
      const inMillions = price / 1000000;
      formattedPrice = `${inMillions.toFixed(inMillions % 1 === 0 ? 0 : 1)}M`;
    }
    
    return <span className={className}>{formattedPrice} L.E</span>;
  }
  
  // For other currencies, use standard Intl formatting
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });
  
  let formattedPrice = formatter.format(price);
  
  return <span className={className}>{formattedPrice}</span>;
}
