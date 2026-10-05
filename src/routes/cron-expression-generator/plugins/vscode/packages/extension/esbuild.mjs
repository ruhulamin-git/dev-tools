import esbuild from 'esbuild';

// The engine and both npm dependencies are bundled in; only `vscode` is external, because the
// editor supplies it at runtime and it exists on no registry.
const options = {
	entryPoints: ['src/extension.ts'],
	bundle: true,
	outfile: 'dist/extension.js',
	platform: 'node',
	// Matches the Node that ships inside the minimum VS Code declared in package.json.
	target: 'node18',
	format: 'cjs',
	external: ['vscode'],
	sourcemap: true,
	minify: !process.argv.includes('--watch')
};

if (process.argv.includes('--watch')) {
	const context = await esbuild.context(options);
	await context.watch();
	console.log('watching');
} else {
	await esbuild.build(options);
	console.log('built dist/extension.js');
}
