const arrOfString = [
  "",
  "Satu ",
  "Dua ",
  "Tiga ",
  "Empat ",
  "Lima ",
  "Enam ",
  "Tujuh ",
  "Delapan ",
  "Sembilan ",
  "Sepuluh ",
  "Sebelas ",
];

export default function convertString(angka: number): string {
  if (angka < 12) {
    return arrOfString[angka];
  }

  if (angka < 20) {
    return arrOfString[angka % 10] + "Belas ";
  }

  if (angka < 100) {
    return (
      arrOfString[Math.floor(angka / 10)] +
      "Puluh " +
      convertString(angka % 10)
    );
  }

  if (angka < 200) {
    return "Seratus " + convertString(angka % 100);
  }

  if (angka < 1000) {
    return (
      arrOfString[Math.floor(angka / 100)] +
      "Ratus " +
      convertString(angka % 100)
    );
  }

  if (angka < 2000) {
    return "Seribu " + convertString(angka % 1000);
  }

  if (angka < 1000000) {
    return (
      convertString(Math.floor(angka / 1000)) +
      "Ribu " +
      convertString(angka % 1000)
    );
  }

  if (angka < 1000000000) {
    return (
      convertString(Math.floor(angka / 1000000)) +
      "Juta " +
      convertString(angka % 1000000)
    );
  }

  if (angka < 1000000000000) {
    return (
      convertString(Math.floor(angka / 1000000000)) +
      "Miliar " +
      convertString(angka % 1000000000)
    );
  }

  if (angka < 1000000000000000) {
    return (
      convertString(Math.floor(angka / 1000000000000)) +
      "Triliun " +
      convertString(angka % 1000000000000)
    );
  }

  return "-";
}