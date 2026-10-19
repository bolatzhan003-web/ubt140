// Kazakhstan Phone Formatter Mask: +7 (7XX) XXX-XX-XX
export function formatKazakhstanPhone(input) {
  if (!input) return '';
  
  // Extract all digits
  let digits = input.replace(/\D/g, '');
  if (!digits) return '';

  // Normalize leading 8 to 7, or prepend 7 if user started with 7xx
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  } else if (!digits.startsWith('7')) {
    digits = '7' + digits;
  }

  // Maximum 11 digits (7 + 10 digits for KZ mobile operators: 700, 701, 702, 705, 707, 708, 747, 771, 775, 776, 777, 778, etc.)
  digits = digits.slice(0, 11);

  let formatted = '+7';
  if (digits.length > 1) {
    formatted += ' (' + digits.substring(1, 4);
  }
  if (digits.length >= 4) {
    formatted += ') ' + digits.substring(4, 7);
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.substring(7, 9);
  }
  if (digits.length >= 9) {
    formatted += '-' + digits.substring(9, 11);
  }

  return formatted;
}

export function cleanPhoneDigits(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}
