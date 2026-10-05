import type { TaxTreatment } from './types';

/** Display labels for tax treatments (hyphenated where conventional). */
export const TAX_TREATMENT_LABELS: Record<TaxTreatment, string> = {
	standard: 'Standard',
	zero_rated_export: 'Zero-rated export',
	reverse_charge: 'Reverse charge',
	exempt: 'Exempt',
	none: 'None'
};

export function getTaxTreatmentLabel(treatment: TaxTreatment | undefined): string | null {
	if (!treatment || treatment === 'standard') return null;
	return TAX_TREATMENT_LABELS[treatment] ?? treatment.replace(/_/g, ' ');
}
