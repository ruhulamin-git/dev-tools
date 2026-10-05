export interface PropertyInfo {
	key: string;
	type: string;
	isOptional: boolean;
	interfaceName: string;
	path: string; // unique path like "RootObject.address.street"
}

export interface InterfaceInfo {
	name: string;
	properties: PropertyInfo[];
}

export interface ConversionOptions {
	rootName: string;
	optionalMap: Record<string, boolean>; // path -> isOptional
}

export interface ParseResult {
	interfaces: InterfaceInfo[];
	output: string;
}

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function parseJsonToInterfaces(json: string | JsonValue, rootName: string): InterfaceInfo[] {
	const interfaces: InterfaceInfo[] = [];
	const seenInterfaces = new Set<string>();

	function toPascalCase(str: string): string {
		return str
			.replace(/[^a-zA-Z0-9](.)/g, (_, char: string) => char.toUpperCase())
			.replace(/^(.)/, (char) => char.toUpperCase());
	}

	function getType(val: JsonValue, key: string, parentPath: string): string {
		if (val === null) return 'null';
		if (Array.isArray(val)) {
			if (val.length === 0) return 'unknown[]';
			const itemTypes = new Set(val.map((item) => getType(item, key, parentPath)));
			if (itemTypes.size === 1) {
				return `${Array.from(itemTypes)[0]}[]`;
			}
			return `(${Array.from(itemTypes).join(' | ')})[]`;
		}
		if (typeof val === 'object') {
			const interfaceName = toPascalCase(key);
			generateInterface(val as Record<string, JsonValue>, interfaceName, `${parentPath}.${key}`);
			return interfaceName;
		}
		return typeof val;
	}

	function generateInterface(obj: Record<string, JsonValue>, name: string, basePath: string) {
		if (seenInterfaces.has(name)) return;
		seenInterfaces.add(name);

		const properties: PropertyInfo[] = [];
		for (const key in obj) {
			const val = obj[key];
			const path = `${basePath}.${key}`;
			const type = getType(val, key, basePath);
			properties.push({
				key,
				type,
				isOptional: false,
				interfaceName: name,
				path
			});
		}
		interfaces.unshift({ name, properties });
	}

	try {
		let parsed: JsonValue = typeof json === 'string' ? JSON.parse(json) : json;
		if (typeof parsed !== 'object' || parsed === null) {
			return [];
		}

		if (Array.isArray(parsed)) {
			if (parsed.length === 0) return [];
			parsed = parsed[0];
		}

		generateInterface(
			parsed as Record<string, JsonValue>,
			rootName || 'RootObject',
			rootName || 'RootObject'
		);
		return interfaces;
	} catch {
		return [];
	}
}

export function generateTsFromInterfaces(
	interfaces: InterfaceInfo[],
	optionalMap: Record<string, boolean>,
	outputMode: 'interface' | 'type' = 'interface'
): string {
	if (interfaces.length === 0) return '';

	return interfaces
		.map((iface) => {
			if (outputMode === 'type') {
				let str = `type ${iface.name} = {\n`;
				for (const prop of iface.properties) {
					const isOptional = optionalMap[prop.path] ?? false;
					const optionalMark = isOptional ? '?' : '';
					str += `  ${prop.key}${optionalMark}: ${prop.type};\n`;
				}
				str += '};';
				return str;
			} else {
				let str = `interface ${iface.name} {\n`;
				for (const prop of iface.properties) {
					const isOptional = optionalMap[prop.path] ?? false;
					const optionalMark = isOptional ? '?' : '';
					str += `  ${prop.key}${optionalMark}: ${prop.type};\n`;
				}
				str += '}';
				return str;
			}
		})
		.join('\n\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

export function downloadFile(content: string, fileName: string, contentType: string) {
	const a = document.createElement('a');
	const file = new Blob([content], { type: contentType });
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
	URL.revokeObjectURL(a.href);
}
