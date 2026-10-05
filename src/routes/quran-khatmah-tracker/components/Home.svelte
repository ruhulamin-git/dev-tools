<script lang="ts">
	import { t } from '../lib/i18n.svelte';
	import { khatmah } from '../lib/khatmah.svelte';

	const invited = $derived(!!khatmah.code);

	let createCount = $state(30);
	let createDedication = $state('');
	let joinCode = $state('');
	let joinName = $state('');
	let joinId = $state('');
	let openFaq = $state(0);

	$effect(() => {
		if (khatmah.joinCodePrefill) joinCode = khatmah.joinCodePrefill;
	});

	const steps = [
		{ n: '1', t: 'home.steps.s1t', b: 'home.steps.s1b' },
		{ n: '2', t: 'home.steps.s2t', b: 'home.steps.s2b' },
		{ n: '3', t: 'home.steps.s3t', b: 'home.steps.s3b' }
	];
	const benefits = [
		{ icon: '⚡', t: 'home.benefits.b1t', b: 'home.benefits.b1b' },
		{ icon: '📖', t: 'home.benefits.b2t', b: 'home.benefits.b2b' },
		{ icon: '📱', t: 'home.benefits.b3t', b: 'home.benefits.b3b' },
		{ icon: '🌍', t: 'home.benefits.b4t', b: 'home.benefits.b4b' },
		{ icon: '🔒', t: 'home.benefits.b5t', b: 'home.benefits.b5b' },
		{ icon: '🤲', t: 'home.benefits.b6t', b: 'home.benefits.b6b' }
	];
	const faqs = [1, 2, 3, 4, 5];

	function scrollTo(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
</script>

<div class="kh-screen kh-screen--home">
	<!-- HERO -->
	<section class="kh-hero">
		<div class="kh-hero-ghost kh-serif" aria-hidden="true">۞</div>
		<div class="kh-hero-badge">
			<span class="kh-hero-dot"></span>{t('home.hero.badge')}
		</div>
		<h1 class="kh-serif kh-hero-title">{t('home.hero.title')}</h1>
		<p class="kh-hero-lead">{t('home.hero.lead')}</p>
		<div class="kh-hero-cta">
			<button class="kh-btn kh-btn-gold" onclick={() => scrollTo('kh-create')}>{t('home.hero.start')}</button>
			<button class="kh-btn kh-btn-ghost" onclick={() => scrollTo('kh-join')}>{t('home.hero.join')}</button>
		</div>
		<div class="kh-hero-pills">
			<span class="kh-pill">{t('home.hero.pill1')}</span>
			<span class="kh-pill">{t('home.hero.pill2')}</span>
			<span class="kh-pill">{t('home.hero.pill3')}</span>
		</div>
	</section>

	<div class="kh-divider"><span class="kh-divider-line"></span><span class="kh-serif" style="font-size:20px;color:var(--kh-gold-3)">۞</span><span class="kh-divider-line kh-divider-line--r"></span></div>

	<!-- STEPS -->
	<section class="kh-block">
		<h2 class="kh-serif kh-section-title">{t('home.steps.title')}</h2>
		<div class="kh-grid-3">
			{#each steps as s (s.n)}
				<div class="kh-card kh-step">
					<span class="kh-serif kh-step-num">{s.n}</span>
					<h3 class="kh-step-title">{t(s.t)}</h3>
					<p class="kh-step-body">{t(s.b)}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- BENEFITS -->
	<section class="kh-block">
		<h2 class="kh-serif kh-section-title" style="margin-bottom:8px">{t('home.benefits.title')}</h2>
		<p class="kh-section-sub">{t('home.benefits.sub')}</p>
		<div class="kh-grid-bf">
			{#each benefits as f (f.t)}
				<div class="kh-benefit">
					<span class="kh-benefit-icon">{f.icon}</span>
					<div>
						<h3 class="kh-benefit-title">{t(f.t)}</h3>
						<p class="kh-benefit-body">{t(f.b)}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- CREATE / JOIN -->
	<section class="kh-block kh-cards">
		{#if !invited}
			<div id="kh-create" class="kh-card kh-formcard">
				<div class="kh-formcard-head"><span style="font-size:18px">✦</span><h3 class="kh-serif kh-formcard-title">{t('home.create.title')}</h3></div>
				<p class="kh-formcard-sub">{t('home.create.cardSub')}</p>
				<label class="kh-label" for="createCount">{t('home.create.count')}</label>
				<input id="createCount" class="kh-input" type="number" min="1" max="604" bind:value={createCount} placeholder={t('home.create.countPlaceholder')} />
				<p class="kh-hint">{t('home.create.countHint')}</p>
				<label class="kh-label" for="createDedication" style="margin-top:18px">{t('home.create.dedication')}</label>
				<input id="createDedication" class="kh-input" type="text" bind:value={createDedication} placeholder={t('home.create.dedicationPlaceholder')} />
				<button class="kh-btn kh-btn-gold kh-btn-block" style="margin-top:22px" onclick={() => khatmah.createRoom(Number(createCount), createDedication)}>{t('home.create.button')}</button>
			</div>

			<div class="kh-or"><span class="kh-or-badge">{t('home.or')}</span></div>
		{/if}

		<div id="kh-join" class="kh-panel kh-formcard">
			<div class="kh-formcard-head"><span style="font-size:18px">⌨</span><h3 class="kh-serif kh-formcard-title">{t('home.join.title')}</h3></div>
			<p class="kh-formcard-sub">{t('home.join.cardSub')}</p>
			<label class="kh-label" for="joinCode">{t('home.join.code')}</label>
			<input id="joinCode" class="kh-input kh-input--code" type="text" bind:value={joinCode} placeholder={t('home.join.codePlaceholder')} style="margin-bottom:14px" />
			<label class="kh-label" for="joinName">{t('home.join.name')}</label>
			<input id="joinName" class="kh-input" type="text" bind:value={joinName} placeholder={t('home.join.namePlaceholder')} style="margin-bottom:14px" />
			<label class="kh-label" for="joinId">{t('home.join.id')}</label>
			<input id="joinId" class="kh-input" type="text" bind:value={joinId} placeholder={t('home.join.idPlaceholder')} />
			{#if khatmah.homeErrorText}
				<p class="kh-error">{khatmah.homeErrorText}</p>
			{/if}
			<button class="kh-btn kh-btn-ghost kh-btn-block" style="margin-top:20px" onclick={() => khatmah.submitJoin(joinCode, joinName, joinId)}>{t('home.join.button')}</button>
		</div>
	</section>

	<!-- FAQ -->
	{#if !invited}
		<section class="kh-block kh-faq">
			<h2 class="kh-serif kh-section-title">{t('home.faq.title')}</h2>
			<div class="kh-faq-list">
				{#each faqs as n (n)}
					<div class="kh-faq-item" class:open={openFaq === n} onclick={() => (openFaq = openFaq === n ? -1 : n)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && (openFaq = openFaq === n ? -1 : n)}>
						<div class="kh-faq-q">
							<span>{t(`home.faq.q${n}`)}</span>
							<span class="kh-faq-icon">+</span>
						</div>
						{#if openFaq === n}
							<p class="kh-faq-a">{t(`home.faq.a${n}`)}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.kh-hero {
		position: relative;
		text-align: center;
		padding: clamp(20px, 5vw, 52px) 0 clamp(30px, 6vw, 60px);
	}
	.kh-hero-ghost {
		position: absolute;
		top: -18px;
		left: 50%;
		transform: translateX(-50%);
		font-size: clamp(120px, 22vw, 240px);
		color: rgba(227, 192, 136, 0.05);
		pointer-events: none;
		line-height: 1;
		user-select: none;
	}
	.kh-hero-badge {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		padding: 7px 16px;
		border-radius: 999px;
		background: rgba(65, 185, 133, 0.12);
		border: 1px solid rgba(65, 185, 133, 0.34);
		color: #7ce0b2;
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 26px;
	}
	.kh-hero-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #41b985;
		box-shadow: 0 0 10px #41b985;
	}
	.kh-hero-title {
		position: relative;
		font-size: clamp(34px, 5.6vw, 62px);
		line-height: 1.08;
		margin: 0 auto 22px;
		max-width: 16ch;
		color: #f6f1ff;
		text-wrap: balance;
	}
	.kh-hero-lead {
		position: relative;
		max-width: 60ch;
		margin: 0 auto 32px;
		font-size: clamp(15px, 1.6vw, 18px);
		line-height: 1.65;
		color: var(--kh-muted);
	}
	.kh-hero-cta {
		display: flex;
		gap: 14px;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 30px;
	}
	.kh-hero-pills {
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.kh-divider {
		display: flex;
		align-items: center;
		gap: 16px;
		justify-content: center;
		margin: 8px 0 48px;
		color: var(--kh-gold-3);
	}
	.kh-divider-line {
		height: 1px;
		flex: 1;
		max-width: 160px;
		background: linear-gradient(90deg, transparent, rgba(227, 192, 136, 0.45));
	}
	.kh-divider-line--r {
		background: linear-gradient(270deg, transparent, rgba(227, 192, 136, 0.45));
	}
	.kh-block {
		margin-bottom: 64px;
	}
	.kh-section-title {
		font-size: clamp(26px, 3.4vw, 36px);
		text-align: center;
		margin: 0 0 36px;
		color: #f2edff;
	}
	.kh-section-sub {
		text-align: center;
		color: var(--kh-muted-2);
		font-size: 15px;
		margin: 0 auto 34px;
		max-width: 54ch;
	}
	.kh-grid-3 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
		gap: 18px;
	}
	.kh-step {
		padding: 30px 26px 28px;
	}
	.kh-step-num {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		border-radius: 14px;
		background: rgba(227, 192, 136, 0.12);
		border: 1px solid rgba(227, 192, 136, 0.3);
		color: var(--kh-gold-2);
		font-size: 22px;
		margin-bottom: 18px;
	}
	.kh-step-title {
		font-size: 19px;
		font-weight: 700;
		margin: 0 0 9px;
		color: #f1ecff;
	}
	.kh-step-body {
		margin: 0;
		font-size: 14.5px;
		line-height: 1.6;
		color: #ada2cc;
	}
	.kh-grid-bf {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(290px, 100%), 1fr));
		gap: 16px;
	}
	.kh-benefit {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(227, 192, 136, 0.12);
		border-radius: 18px;
		padding: 22px;
	}
	.kh-benefit-icon {
		font-size: 26px;
		line-height: 1;
		flex: none;
	}
	.kh-benefit-title {
		font-size: 16.5px;
		font-weight: 700;
		margin: 2px 0 6px;
		color: #f0ebfe;
	}
	.kh-benefit-body {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
		color: var(--kh-muted-2);
	}
	.kh-cards {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		align-items: stretch;
	}
	.kh-formcard {
		flex: 1 1 330px;
		min-width: 0;
		padding: clamp(22px, 3vw, 34px);
	}
	.kh-formcard-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 6px;
	}
	.kh-formcard-title {
		font-size: 24px;
		margin: 0;
		color: #f3eeff;
	}
	.kh-formcard-sub {
		color: var(--kh-muted-2);
		font-size: 13.5px;
		margin: 0 0 22px;
	}
	.kh-or {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.kh-or-badge {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(227, 192, 136, 0.28);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #9a8fc0;
	}
	.kh-faq {
		max-width: 760px;
		margin-left: auto;
		margin-right: auto;
	}
	.kh-faq-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.kh-faq-item {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(227, 192, 136, 0.14);
		border-radius: 16px;
		padding: 18px 20px;
		cursor: pointer;
		transition: border-color 0.2s ease, background 0.2s ease;
	}
	.kh-faq-item.open {
		border-color: rgba(227, 192, 136, 0.34);
		background: rgba(255, 255, 255, 0.045);
	}
	.kh-faq-q {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}
	.kh-faq-q span:first-child {
		font-size: 16px;
		font-weight: 600;
		color: #efe9fd;
	}
	.kh-faq-icon {
		flex: none;
		font-size: 20px;
		color: var(--kh-gold-2);
		transition: transform 0.2s ease;
	}
	.kh-faq-item.open .kh-faq-icon {
		transform: rotate(45deg);
	}
	.kh-faq-a {
		margin: 14px 0 0;
		font-size: 14.5px;
		line-height: 1.65;
		color: #aba0cb;
	}
</style>
