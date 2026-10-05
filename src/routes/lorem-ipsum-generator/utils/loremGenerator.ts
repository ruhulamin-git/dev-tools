export const LOREM_IPSUM_WORDS = [
	'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
	'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
	'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
	'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
	'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
	'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
	'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
	'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

export const HIPSTER_WORDS = [
	'artisan', 'aesthetic', 'authentic', 'banjo', 'beard', 'bicycle', 'biodiesel',
	'blog', 'brooklyn', 'brunch', 'butcher', 'cardigan', 'chambray', 'chillwave',
	'coffee', 'craft', 'crucifix', 'diy', 'dreamcatcher', 'echo', 'ethical',
	'farm-to-table', 'fashion', 'fixie', 'flannel', 'flexitarian', 'food', 'freegan',
	'gastropub', 'gentrify', 'gluten-free', 'hashtag', 'helvetica', 'hoodie',
	'humblebrag', 'intelligentsia', 'irony', 'jean', 'kale', 'keytar', 'kickstarter',
	'kinfolk', 'kombucha', 'leggings', 'letterpress', 'listicle', 'literally',
	'locavore', 'lomo', 'marfa', 'meditation', 'messenger', 'microdosing', 'mixtape',
	'mumblecore', 'mustache', 'narwhal', 'neutra', 'normcore', 'organic', 'paleo'
];

export const BACON_WORDS = [
	'bacon', 'ipsum', 'dolor', 'amet', 'beef', 'ribs', 'chicken', 'pork',
	'chop', 'ham', 'hock', 'shank', 'brisket', 'sirloin', 'ribeye', 'tenderloin',
	'strip', 'steak', 'flank', 'meatball', 'meatloaf', 'ground', 'round', 'chuck',
	'shoulder', 'belly', 'loin', 'spare', 'short', 'tri-tip', 'filet', 'mignon',
	'porchetta', 'prosciutto', 'pancetta', 'capicola', 'salami', 'sausage',
	'kielbasa', 'andouille', 'chorizo', 'frankfurter', 'bratwurst', 'bologna',
	'pastrami', 'corned', 'jerky', 'bresaola', 'fatback', 'jowl', 'tongue'
];

export type PlaceholderType = 'lorem' | 'hipster' | 'bacon';
export type GenerationType = 'paragraphs' | 'words' | 'sentences' | 'lists';
export type OutputFormat = 'plain' | 'html' | 'list';

export const PLACEHOLDER_LABELS: Record<PlaceholderType, string> = {
	lorem: 'Classic Lorem Ipsum',
	hipster: 'Hipster Ipsum',
	bacon: 'Bacon Ipsum'
};

export const GENERATION_LABELS: Record<GenerationType, string> = {
	paragraphs: 'Paragraphs',
	words: 'Words',
	sentences: 'Sentences',
	lists: 'List Items'
};

export const OUTPUT_LABELS: Record<OutputFormat, string> = {
	plain: 'Plain Text',
	html: 'HTML (<p> tags)',
	list: 'HTML List (<ul><li>)'
};

const WORD_SOURCES: Record<PlaceholderType, string[]> = {
	lorem: LOREM_IPSUM_WORDS,
	hipster: HIPSTER_WORDS,
	bacon: BACON_WORDS
};

function getRandomWord(words: string[]): string {
	return words[Math.floor(Math.random() * words.length)];
}

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateWords(count: number, type: PlaceholderType, startWithLorem: boolean): string[] {
	const words = WORD_SOURCES[type];
	const result: string[] = [];

	if (startWithLorem && type === 'lorem' && count >= 5) {
		result.push('lorem', 'ipsum', 'dolor', 'sit', 'amet');
		for (let i = 5; i < count; i++) result.push(getRandomWord(words));
	} else {
		for (let i = 0; i < count; i++) result.push(getRandomWord(words));
	}
	return result;
}

function generateSentence(type: PlaceholderType, minWords = 8, maxWords = 16, startWithLorem = false): string {
	const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;

	if (startWithLorem && type === 'lorem') {
		const remaining = Math.max(0, wordCount - 8);
		const words = WORD_SOURCES[type];
		const extraWords = Array.from({ length: remaining }, () => getRandomWord(words));
		return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' + (extraWords.length ? ', ' + extraWords.join(' ') : '') + '.';
	}

	const words = generateWords(wordCount, type, false);
	words[0] = capitalize(words[0]);

	if (words.length > 6) {
		const commaPos = Math.floor(words.length / 2) + Math.floor(Math.random() * 3) - 1;
		if (commaPos > 0 && commaPos < words.length - 1) words[commaPos] = words[commaPos] + ',';
	}
	return words.join(' ') + '.';
}

function generateParagraph(type: PlaceholderType, sentenceCount = 5, startWithLorem = false): string {
	const sentences: string[] = [];
	for (let i = 0; i < sentenceCount; i++) {
		sentences.push(generateSentence(type, 8, 16, startWithLorem && i === 0));
	}
	return sentences.join(' ');
}

export interface GeneratorOptions {
	type: PlaceholderType;
	generationType: GenerationType;
	quantity: number;
	outputFormat: OutputFormat;
	startWithLorem: boolean;
}

export function generateLoremIpsum(options: GeneratorOptions): string {
	const { type, generationType, quantity, outputFormat, startWithLorem } = options;
	const safeQuantity = Math.min(Math.max(1, quantity), 1000);
	let items: string[] = [];

	switch (generationType) {
		case 'words': {
			const words = generateWords(safeQuantity, type, startWithLorem);
			if (outputFormat === 'list') {
				items = words.map(capitalize);
			} else {
				words[0] = capitalize(words[0]);
				return words.join(' ');
			}
			break;
		}
		case 'sentences': {
			for (let i = 0; i < safeQuantity; i++) {
				items.push(generateSentence(type, 8, 16, startWithLorem && i === 0));
			}
			break;
		}
		case 'paragraphs': {
			for (let i = 0; i < safeQuantity; i++) {
				const sentenceCount = Math.floor(Math.random() * 4) + 4;
				items.push(generateParagraph(type, sentenceCount, startWithLorem && i === 0));
			}
			break;
		}
		case 'lists': {
			for (let i = 0; i < safeQuantity; i++) {
				items.push(generateSentence(type, 5, 12, startWithLorem && i === 0));
			}
			break;
		}
	}
	return formatOutput(items, outputFormat, generationType);
}

function formatOutput(items: string[], format: OutputFormat, genType: GenerationType): string {
	switch (format) {
		case 'plain':
			if (genType === 'paragraphs') return items.join('\n\n');
			if (genType === 'lists') return items.map((item) => `• ${item}`).join('\n');
			return items.join(' ');
		case 'html':
			if (genType === 'paragraphs' || genType === 'sentences') return items.map((item) => `<p>${item}</p>`).join('\n');
			return `<p>${items.join(' ')}</p>`;
		case 'list':
			return `<ul>\n${items.map((item) => `  <li>${item}</li>`).join('\n')}\n</ul>`;
		default:
			return items.join('\n');
	}
}

export function validateQuantity(value: number): { valid: boolean; error?: string } {
	if (isNaN(value) || value < 1) return { valid: false, error: 'Quantity must be at least 1' };
	if (value > 1000) return { valid: false, error: 'Quantity cannot exceed 1000' };
	return { valid: true };
}
