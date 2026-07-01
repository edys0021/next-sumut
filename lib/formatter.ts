export default function formatCurrency(text: string): string {
  let value = 0;

  const currencyFormat = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (text !== "") {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    value = digitsOnly === "" ? 0 : Number(digitsOnly);
  }

  return currencyFormat.format(value);
}

