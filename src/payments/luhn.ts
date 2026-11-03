export function passesLuhnCheck(cardNumber: string): boolean {
  let sum = 0;

  for (let i = 0; i < cardNumber.length; i++) {
    let digit = Number(cardNumber[cardNumber.length - 1 - i]);

    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
  }

  return sum % 10 === 0;
}
