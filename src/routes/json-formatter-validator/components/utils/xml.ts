function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function toValidXmlName(name: string): string {
	let xmlName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
	if (!/^[a-zA-Z]/.test(xmlName)) {
		xmlName = 'item_' + xmlName;
	}
	return xmlName;
}

function getSingularName(pluralName: string): string {
	const irregulars: Record<string, string> = {
		children: 'child',
		people: 'person',
		men: 'man',
		women: 'woman',
		feet: 'foot',
		teeth: 'tooth',
		geese: 'goose',
		mice: 'mouse'
	};

	const lower = pluralName.toLowerCase();
	if (irregulars[lower]) return irregulars[lower];

	if (pluralName.endsWith('ies') && pluralName.length > 4) {
		return pluralName.slice(0, -3) + 'y';
	}

	if (
		pluralName.endsWith('sses') ||
		pluralName.endsWith('xes') ||
		pluralName.endsWith('zes') ||
		pluralName.endsWith('ches') ||
		pluralName.endsWith('shes')
	) {
		return pluralName.slice(0, -2);
	}

	if (pluralName.endsWith('s') && pluralName.length > 2) {
		return pluralName.slice(0, -1);
	}

	return pluralName;
}

function toXml(value: unknown, name: string, indent: string = ''): string {
	const xmlName = toValidXmlName(name);

	if (value === null) {
		return `${indent}<${xmlName}></${xmlName}>`;
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return `${indent}<${xmlName}></${xmlName}>`;
		}
		const itemName = getSingularName(xmlName);
		const items = value.map((item) => toXml(item, itemName, indent + '  ')).join('\n');
		return `${indent}<${xmlName}>\n${items}\n${indent}</${xmlName}>`;
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>);
		if (entries.length === 0) {
			return `${indent}<${xmlName}></${xmlName}>`;
		}
		const children = entries.map(([k, v]) => toXml(v, k, indent + '  ')).join('\n');
		return `${indent}<${xmlName}>\n${children}\n${indent}</${xmlName}>`;
	}

	return `${indent}<${xmlName}>${escapeXml(String(value))}</${xmlName}>`;
}

export function jsonToXml(data: unknown, rootName: string = 'root'): string {
	const xml = toXml(data, rootName);
	return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}
