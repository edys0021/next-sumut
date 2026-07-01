export default function isValidNominal(
  input: string,
  min: number
): boolean {
  const nominal = Number(input);

  return !Number.isNaN(nominal) &&
         nominal >= min &&
         nominal % min === 0;
}