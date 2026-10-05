<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		Input,
		Textarea,
		Label,
		Button
	} from '$lib/shared/components/ui';
	import type { Algorithm, VerificationResult } from '../utils/jwtValidator';
	import { verifyHS256, verifyRS256 } from '../utils/jwtValidator';

	interface Props {
		token: string;
	}
	let { token }: Props = $props();
	let algorithm = $state<Algorithm>('HS256');
	let secretKey = $state('');
	let publicKey = $state('');
	let verificationResult = $state<VerificationResult | null>(null);
	let isVerifying = $state(false);

	$effect(() => {
		if (token) {
			try {
				const parts = token.trim().split('.');
				if (parts.length === 3) {
					const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
					if (header.alg === 'RS256') algorithm = 'RS256';
					else if (header.alg === 'HS256') algorithm = 'HS256';
				}
			} catch {}
		}
	});

	const handleVerify = async () => {
		if (!token) return;
		isVerifying = true;
		verificationResult = null;
		try {
			verificationResult =
				algorithm === 'HS256'
					? await verifyHS256(token, secretKey)
					: await verifyRS256(token, publicKey);
		} catch {
			verificationResult = { verified: false, message: 'Verification failed' };
		} finally {
			isVerifying = false;
		}
	};

	const canVerify = $derived(
		(algorithm === 'HS256' && secretKey.trim().length > 0) ||
			(algorithm === 'RS256' && publicKey.trim().length > 0)
	);
</script>

<Card class="border-slate-200 shadow-lg dark:border-slate-800">
	<CardHeader>
		<CardTitle>Signature Verification</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<!-- Algorithm Selection -->
		<div class="space-y-2">
			<Label>Algorithm</Label>
			<div class="flex gap-2 rounded-lg border border-slate-200 p-1 dark:border-slate-800">
				<Button
					variant={algorithm === 'HS256' ? 'secondary' : 'ghost'}
					size="sm"
					onclick={() => {
						algorithm = 'HS256';
						verificationResult = null;
					}}
					class="flex-1 transition-all {algorithm === 'HS256'
						? 'bg-slate-100 shadow-sm dark:bg-slate-800'
						: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}"
				>
					HS256
				</Button>
				<Button
					variant={algorithm === 'RS256' ? 'secondary' : 'ghost'}
					size="sm"
					onclick={() => {
						algorithm = 'RS256';
						verificationResult = null;
					}}
					class="flex-1 transition-all {algorithm === 'RS256'
						? 'bg-slate-100 shadow-sm dark:bg-slate-800'
						: 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}"
				>
					RS256
				</Button>
			</div>
		</div>

		<!-- Key Input -->
		{#if algorithm === 'HS256'}
			<div class="space-y-2">
				<Label htmlFor="secret-key">Secret Key</Label>
				<Input
					id="secret-key"
					type="text"
					bind:value={secretKey}
					placeholder="Enter your secret key"
				/>
			</div>
		{:else}
			<div class="space-y-2">
				<Label htmlFor="public-key">Public Key</Label>
				<Textarea
					id="public-key"
					bind:value={publicKey}
					placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
					rows={6}
					class="min-h-[120px] font-mono text-sm"
				/>
			</div>
		{/if}

		<!-- Verify Button -->
		<Button onclick={handleVerify} disabled={!canVerify || isVerifying} class="w-full">
			{isVerifying ? 'Verifying...' : 'Verify Signature'}
		</Button>

		<!-- Verification Result -->
		{#if verificationResult}
			<div
				class="rounded-lg border p-4 {verificationResult.verified
					? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/30'
					: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30'}"
			>
				<div class="flex items-center gap-3">
					<div
						class="rounded-full p-2 {verificationResult.verified
							? 'bg-green-100 text-green-600 dark:bg-green-900/50'
							: 'bg-red-100 text-red-600 dark:bg-red-900/50'}"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							{#if verificationResult.verified}<polyline points="20 6 9 17 4 12" />{:else}<path
									d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
								/><line x1="12" y1="9" x2="12" y2="13" /><line
									x1="12"
									y1="17"
									x2="12.01"
									y2="17"
								/>{/if}
						</svg>
					</div>
					<div>
						<p
							class="text-sm font-semibold {verificationResult.verified
								? 'text-green-700 dark:text-green-400'
								: 'text-red-700 dark:text-red-400'}"
						>
							{verificationResult.verified ? 'Signature Verified' : 'Verification Failed'}
						</p>
						<p class="text-xs text-slate-600 dark:text-slate-400">{verificationResult.message}</p>
					</div>
				</div>
			</div>
		{/if}
	</CardContent>
</Card>
