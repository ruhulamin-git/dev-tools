/**
 * Shared email validation utility
 * Covers all QA test cases — valid and invalid
 */

// Disposable/temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
	'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'guerrillamail.org',
	'mailinator.com', 'maildrop.cc', 'throwaway.email', 'fakeinbox.com',
	'trashmail.com', 'tempail.com', 'dispostable.com', '10minutemail.com',
	'10minutemail.net', 'minutemail.com', 'emailondeck.com', 'getnada.com',
	'mohmal.com', 'tempmailo.com', 'tempr.email', 'discard.email',
	'mailnesia.com', 'spamgourmet.com', 'mytemp.email', 'throwawaymail.com',
	'yopmail.com', 'yopmail.fr', 'sharklasers.com', 'spam4.me', 'grr.la',
	'guerrillamailblock.com', 'pokemail.net', 'spam.la', 'mailcatch.com',
	'tempmailaddress.com', 'burnermail.io', 'mailsac.com', 'inboxkitten.com',
	'getairmail.com', 'fakemailgenerator.com', 'emailfake.com', 'crazymailing.com',
	'tempinbox.com', 'mailnull.com', 'spamfree24.org', 'jetable.org',
	'trash-mail.com', 'mailexpire.com', 'tmpmail.org', 'tmpmail.net',
	'moakt.com', 'emailtemporar.ro', 'temp.email'
]);

export interface EmailValidationResult {
	valid: boolean;
	error: string;
}

/**
 * Validates an email address against all QA test cases.
 *
 * Valid: standard formats, subdomains, plus-addressing, country TLDs, modern TLDs
 * Invalid: missing @, missing username, missing domain, multiple @, consecutive dots,
 *          leading/trailing dots, spaces, invalid chars, missing TLD, disposable domains
 */
export function validateEmail(emailValue: string): EmailValidationResult {
	const trimmed = emailValue.trim();

	if (!trimmed) {
		return { valid: false, error: 'Please enter an email address' };
	}

	// Must have exactly one @
	const atCount = (trimmed.match(/@/g) || []).length;
	if (atCount === 0) return { valid: false, error: 'Please enter a valid email address' };
	if (atCount > 1) return { valid: false, error: 'Please enter a valid email address' };

	const [localPart, domainPart] = trimmed.split('@');

	// Local part checks
	if (!localPart || localPart.length < 1) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// No spaces anywhere
	if (/\s/.test(trimmed)) {
		return { valid: false, error: 'Email address cannot contain spaces' };
	}

	// Local part: no leading or trailing dot
	if (localPart.startsWith('.') || localPart.endsWith('.')) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// Local part: no consecutive dots
	if (/\.{2,}/.test(localPart)) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// Local part: only allowed characters (letters, digits, . _ % + -)
	if (!/^[a-zA-Z0-9._%+\-]+$/.test(localPart)) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// Domain checks
	if (!domainPart) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// Domain must not start with a dot
	if (domainPart.startsWith('.')) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// No consecutive dots in domain
	if (/\.{2,}/.test(domainPart)) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// Domain must contain at least one dot (e.g. gmail.com)
	if (!domainPart.includes('.')) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// Domain: only allowed characters (letters, digits, hyphens, dots)
	if (!/^[a-zA-Z0-9.\-]+$/.test(domainPart)) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// TLD must be at least 2 chars and only letters
	const tld = domainPart.split('.').pop() ?? '';
	if (!/^[a-zA-Z]{2,}$/.test(tld)) {
		return { valid: false, error: 'Please enter a valid email address' };
	}

	// Domain label before TLD must not be empty (catches test@.com)
	const domainLabels = domainPart.split('.');
	for (const label of domainLabels) {
		if (label.length === 0) {
			return { valid: false, error: 'Please enter a valid email address' };
		}
	}

	// Check disposable domains (case-insensitive)
	const lowerDomain = domainPart.toLowerCase();
	if (DISPOSABLE_DOMAINS.has(lowerDomain)) {
		return { valid: false, error: 'Please use a valid business or personal email' };
	}

	return { valid: true, error: '' };
}
