/**
 * Matching utilities for CRM Duplicate Detection simulation
 */

/**
 * Phonetic Matching (Soundex Algorithm)
 * Returns a 4-character code representing the pronunciation of a word.
 */
export function soundex(s) {
  if (!s) return '';
  let a = s.toLowerCase().split('');
  let f = a.shift();
  let r = '';
  let codes = {
    a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '',
    b: 1, f: 1, p: 1, v: 1,
    c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
    d: 3, t: 3,
    l: 4,
    m: 5, n: 5,
    r: 6
  };

  r = f + a
    .map(v => codes[v])
    .filter((v, i, b) => (i === 0 ? v !== codes[f] : v !== b[i - 1]))
    .join('');

  return (r + '000').slice(0, 4).toUpperCase();
}

/**
 * Fuzzy Matching (Levenshtein Distance)
 * Returns the minimum number of single-character edits required to change one word into the other.
 */
export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity percentage based on Levenshtein Distance
 */
export function getSimilarity(a, b) {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const longestLength = Math.max(a.length, b.length);
  if (longestLength === 0) return 100;
  return Math.round(((longestLength - distance) / longestLength) * 100);
}

/**
 * Phone Normalization
 * Strip all non-numeric characters and return standard format
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return cleaned;
}

/**
 * Extract domain from email
 */
export function getDomain(email) {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1].toLowerCase();
}

/**
 * Combined Confidence Score Calculation
 * Simulates a complex scoring algorithm
 */
export function calculateConfidence(record1, record2, options = {}) {
  const weights = {
    name: 0.4,
    email: 0.3,
    phone: 0.2,
    domain: 0.1
  };

  let totalScore = 0;
  let matches = [];

  // 1. Name Match (Phonetic + Fuzzy)
  const name1 = `${record1.first_name || ''} ${record1.last_name || record1.name || ''}`.trim();
  const name2 = `${record2.first_name || ''} ${record2.last_name || record2.name || ''}`.trim();
  
  const nameSimilarity = getSimilarity(name1, name2);
  const phoneticMatch = soundex(name1) === soundex(name2);
  
  let nameScore = nameSimilarity;
  if (phoneticMatch && nameSimilarity < 90) nameScore = Math.min(95, nameScore + 20);
  
  totalScore += (nameScore / 100) * weights.name;
  if (nameScore > 70) matches.push({ field: 'Name', score: nameScore, method: phoneticMatch ? 'Phonetic' : 'Fuzzy' });

  // 2. Email Match
  if (record1.email && record2.email) {
    const emailMatch = record1.email.toLowerCase() === record2.email.toLowerCase();
    const emailScore = emailMatch ? 100 : 0;
    totalScore += (emailScore / 100) * weights.email;
    if (emailMatch) matches.push({ field: 'Email', score: 100, method: 'Exact' });
  }

  // 3. Phone Match
  const phone1 = normalizePhone(record1.phone || record1.mobile);
  const phone2 = normalizePhone(record2.phone || record2.mobile);
  if (phone1 && phone2) {
    const phoneMatch = phone1 === phone2;
    const phoneScore = phoneMatch ? 100 : 0;
    totalScore += (phoneScore / 100) * weights.phone;
    if (phoneMatch) matches.push({ field: 'Phone', score: 100, method: 'Normalized' });
  }

  // 4. Domain Match
  const domain1 = getDomain(record1.email);
  const domain2 = getDomain(record2.email) || getDomain(record2.website);
  if (domain1 && domain2) {
    const domainMatch = domain1 === domain2;
    const domainScore = domainMatch ? 100 : 0;
    totalScore += (domainScore / 100) * weights.domain;
    if (domainMatch) matches.push({ field: 'Domain', score: 100, method: 'Extracted' });
  }

  const finalConfidence = Math.round(totalScore * 100);
  
  let flag = 'Low Risk';
  if (finalConfidence >= 85) flag = 'High Confidence';
  else if (finalConfidence >= 60) flag = 'Possible Duplicate';

  return {
    score: finalConfidence,
    matches,
    flag
  };
}
