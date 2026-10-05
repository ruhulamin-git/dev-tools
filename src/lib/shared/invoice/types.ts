export interface LineItem {
	id: number;
	description: string;
	qty: number;
	price: number;
	/** Optional unit of measure (hour, day, item, …). */
	unit?: string;
}

export interface CustomField {
	id: string;
	name: string;
	value: string;
}

export type TaxTreatment =
	| 'standard'
	| 'zero_rated_export'
	| 'reverse_charge'
	| 'exempt'
	| 'none';

export type ChargeBearer = 'OUR' | 'SHA' | 'BEN';

export type DiscountType = 'fixed' | 'percentage';

export type PaymentTermsPreset =
	| 'Due on receipt'
	| 'Net 7'
	| 'Net 14'
	| 'Net 30'
	| 'Net 60'
	| 'Custom';

export interface InvoiceData {
	logo: string | null;
	businessName: string;
	businessAddress: string;
	taxId?: string;
	clientName: string;
	clientAddress: string;
	clientTaxId?: string;
	clientCountry?: string;
	invoiceNumber: string;
	issuedDate: string;
	dueDate: string;
	paymentTermsPreset?: PaymentTermsPreset;
	/** Optional service / delivery start (ISO date). */
	servicePeriodStart?: string;
	/** Optional service / delivery end (ISO date). When omitted with start set → single delivery date. */
	servicePeriodEnd?: string;
	lineItems: LineItem[];
	notes?: string;
	subtotal: number;
	discountType?: DiscountType;
	discount: number;
	calculatedDiscount?: number;
	taxPercent: number;
	taxAmount: number;
	taxTreatment?: TaxTreatment;
	shipping: number;
	total: number;
	amountPaid?: number;
	balanceDue?: number;
	currencySymbol: string;
	currencyCode?: string;
	accentColor: string;
	/** Project / engagement name shown in the PROJECT block. */
	projectName?: string;
	showAmountInWords?: boolean;
	signatoryName?: string;
	signatoryTitle?: string;
	signatureImage?: string | null;
	bankName?: string;
	accountName?: string;
	firstName?: string;
	lastName?: string;
	accountNumber?: string;
	routingNumber?: string;
	branchName?: string;
	branchAddress?: string;
	accountType?: string;
	transactionType?: string;
	paymentMethod?: string;
	swiftBicCode?: string;
	intermediaryBankName?: string;
	intermediarySwiftBic?: string;
	chargeBearer?: ChargeBearer;
	paymentReference?: string;
	paypalEmail?: string;
	mobileNumber?: string;
	qrCode?: string | null;
	selectedCountry?: string;
	preview?: boolean;
	businessCustomFields?: { name: string; value: string }[];
	clientCustomFields?: { name: string; value: string }[];
	projectCustomFields?: { name: string; value: string }[];
}
