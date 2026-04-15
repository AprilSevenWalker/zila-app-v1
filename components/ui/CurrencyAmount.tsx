interface CurrencyAmountProps {
  amount: string;
  align?: "left" | "right";
  containerClassName?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  showSecondary?: boolean;
}

const USD_TO_KES_RATE = 130;

function parseUsdAmount(amount: string) {
  const normalized = amount.replace(/[^0-9.]/g, "");
  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function formatKes(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount * USD_TO_KES_RATE));
}

export function CurrencyAmount({
  amount,
  align = "left",
  containerClassName = "",
  primaryClassName = "",
  secondaryClassName = "",
  showSecondary = true,
}: CurrencyAmountProps) {
  const numeric = parseUsdAmount(amount);
  const alignment = align === "right" ? "items-end text-right" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignment} ${containerClassName}`.trim()}>
      <span className={primaryClassName}>{amount}</span>
      {showSecondary && numeric ? (
        <span className={secondaryClassName}>{`≈ KES ${formatKes(numeric)}`}</span>
      ) : null}
    </div>
  );
}

export function getFxHelperText() {
  return "Using today's FX reference rate";
}
