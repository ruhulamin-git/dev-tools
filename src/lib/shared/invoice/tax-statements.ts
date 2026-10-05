import type { TaxTreatment } from './types';

/**
 * Statutory / explanatory text printed under the totals for non-standard tax treatments.
 * Placeholder copy only — replace after accountant review.
 * Labels must stay in sync with `tax-treatment-labels.ts`.
 */
// TODO: confirm wording with accountant
export const TAX_TREATMENT_STATEMENTS: Record<Exclude<TaxTreatment, 'standard'>, string> = {
	// TODO: confirm wording with accountant
	zero_rated_export: 'Zero-rated export — tax charged at 0%.',
	// TODO: confirm wording with accountant
	reverse_charge: 'Reverse charge — tax due by the recipient.',
	// TODO: confirm wording with accountant
	exempt: 'Exempt from tax.',
	// TODO: confirm wording with accountant
	none: 'No tax applied.'
};

export function getTaxTreatmentStatement(treatment: TaxTreatment | undefined): string | null {
	if (!treatment || treatment === 'standard') return null;
	return TAX_TREATMENT_STATEMENTS[treatment] ?? null;
}
