// Phone number validation utilities for Malaysian phone numbers

export interface PhoneValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateMalaysianPhone = (
  phone: string,
  isRequired: boolean = false,
  language: 'en' | 'ms' = 'en'
): PhoneValidationResult => {
  // Remove all spaces, hyphens and other formatting characters
  const cleanPhone = phone.replace(/[\s\-\+]/g, '');
  
  // If phone is empty
  if (!cleanPhone || cleanPhone.trim() === '') {
    if (isRequired) {
      return {
        isValid: false,
        error: language === 'en' 
          ? 'Phone number is required'
          : 'Nombor telefon diperlukan'
      };
    }
    return { isValid: true };
  }
  
  // Check if contains only numbers
  if (!/^\d+$/.test(cleanPhone)) {
    return {
      isValid: false,
      error: language === 'en'
        ? 'Phone number can only contain numbers'
        : 'Nombor telefon hanya boleh mengandungi nombor'
    };
  }
  
  // Check if starts with 0 (Malaysian format)
  if (!cleanPhone.startsWith('0')) {
    return {
      isValid: false,
      error: language === 'en'
        ? 'Phone number must start with 0 (Malaysian format)'
        : 'Nombor telefon mesti bermula dengan 0 (format Malaysia)'
    };
  }
  
  // Check minimum length (Malaysian mobile numbers are typically 10-11 digits)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    return {
      isValid: false,
      error: language === 'en'
        ? 'Phone number must be 10-11 digits long'
        : 'Nombor telefon mestilah 10-11 digit panjang'
    };
  }
  
  return { isValid: true };
};

export const formatPhoneForDisplay = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  
  // Format as XXX-XXXXXXX for Malaysian numbers
  if (digits.length >= 3) {
    const formatted = digits.substring(0, 3) + (digits.length > 3 ? '-' + digits.substring(3) : '');
    return formatted;
  }
  
  return digits;
};

export const handlePhoneInput = (
  value: string,
  maxLength: number = 11
): string => {
  // Allow only digits, spaces, and hyphens
  const filtered = value.replace(/[^\d\s\-]/g, '');
  
  // Remove extra spaces and hyphens
  const cleaned = filtered.replace(/[\s\-]+/g, '');
  
  // Limit length
  const limited = cleaned.substring(0, maxLength);
  
  return limited;
};