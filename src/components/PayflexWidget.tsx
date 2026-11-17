import { useEffect, useRef } from 'react';

type PayflexWidgetProps = {
  amount: number;
  className?: string;
};

/**
 * Loads Payflex's hosted calculator widget using the same configuration
 * as the WooCommerce product page (navy logo, pay_type 3).
 */
export function PayflexWidget({ amount, className = '' }: PayflexWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeAmount = Number(amount);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !Number.isFinite(safeAmount) || safeAmount <= 0) return;

    // The Payflex hosted script initialises the widget in its parent container.
    const script = document.createElement('script');
    script.async = true;
    script.type = 'application/javascript';
    script.src = `https://widgets.payflex.co.za/2.0.3/payflex-widget.min.js?type=calculator&amount=${encodeURIComponent(safeAmount.toFixed(2))}&logo_type=navy&pay_type=3`;
    container.appendChild(script);

    return () => {
      script.remove();
      container.replaceChildren();
    };
  }, [safeAmount]);

  if (!Number.isFinite(safeAmount) || safeAmount <= 0) return null;

  return (
    <div
      ref={containerRef}
      className={`payflexCalculatorWidgetContainer min-h-[64px] max-w-full ${className}`}
      data-widget-style="navy"
      data-pay_type="3"
      aria-label="Payflex payment calculator"
    />
  );
}
