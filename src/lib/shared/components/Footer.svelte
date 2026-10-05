<script lang="ts">
	import { base } from '$app/paths';
	import { track } from '$lib/shared/analytics/track';
	import CompanyProfileModal from './CompanyProfileModal.svelte';

	interface Props {
		companyName?: string;
		companyUrl?: string;
		logoSrc?: string;
	}

	const {
		companyName = 'Devxhub Limited',
		companyUrl = 'https://www.devxhub.com',
		logoSrc = '/devxhub-logo.webp'
	}: Props = $props();

	const currentYear = new Date().getFullYear();
	let showModal = $state(false);

	function openCompanyProfileModal() {
		showModal = true;
		// This used to check for `window.gtag` before firing, but this app only ever loads
		// GTM's gtm.js, never the separate gtag.js library — `window.gtag` is never defined, so
		// this event has never actually fired. track() pushes to the dataLayer GTM already reads.
		track('portfolio_click', { label: 'portfolio' });
	}

	function closeModal() {
		showModal = false;
	}

	const company = [
		{ name: 'About Us', path: 'https://www.devxhub.com/about-us' },
		{ name: 'Career', path: 'https://www.devxhub.com/career' },
		{ name: 'Blog', path: 'https://www.devxhub.com/blog' },
		{ name: 'Privacy Policy', path: 'https://www.devxhub.com/privacy-policy' },
		{ name: 'Contact Us', path: 'https://www.devxhub.com/contact' },
		{ name: 'Services', path: 'https://www.devxhub.com/services' },
		{ name: 'Our Process', path: 'https://www.devxhub.com/our-process' },
		{ name: 'Products', path: 'https://www.devxhub.com/products' },
		{ name: 'Tools', path: 'https://www.devxhub.com/tools/' },
		{ name: 'See Company Profile', path: '#', isDownload: true, onClick: openCompanyProfileModal }
	];

	const globalImpact = [
		{ name: 'Top Software Development Companies', path: 'https://www.devxhub.com/services' },
		{ name: 'Staff Augmentation Brand', path: 'https://www.devxhub.com/it-staff-augmentation' },
		{
			name: 'Artificial Intelligence Brand',
			path: 'https://www.devxhub.com/ai-ml-development-integration'
		},
		{
			name: 'Top Clutch Software developers Bangladesh 2025',
			path: 'https://www.devxhub.com/about-us'
		},
		{
			name: 'MVP, SaaS, End-to-End Development',
			path: 'https://www.devxhub.com/mvp-saas-end-to-end-development'
		},
		{
			name: 'Mobile Application Development',
			path: 'https://www.devxhub.com/mobile-application-development'
		},
		{ name: 'DevOps & Cloud Solutions', path: 'https://www.devxhub.com/devops-cloud-solutions' }
	];

	const collaboration = [
		{ name: 'Book a Free Call', path: 'https://calendly.com/devxhub/15min' },
		{ name: 'Partner', path: 'https://www.devxhub.com/contact' },
		{ name: 'Request a Quote', path: 'https://www.devxhub.com/contact' }
	];

	const countryAddresses = [
		{
			image: '/contacts/bangladesh.svg',
			name: 'Bangladesh',
			street: '158/27, Kazla, Boalia, ',
			country: 'Rajshahi-6204, Bangladesh',
			number: '+880 1326 506464'
		},
		{
			image: '/contacts/usa.svg',
			name: 'USA',
			street: '903 1st Street North #1061',
			country: 'Hopkins, MN 55343, United States',
			number: '+1 612 300-7711'
		},
		{
			image: '/contacts/finland.svg',
			name: 'Finland',
			street: 'Viulutie 1 A 1, 00420',
			country: 'Helsinki, Uusimaa, Finland',
			number: '+358 402545717'
		}
	].map((addr) => ({ ...addr, image: getAssetPath(addr.image) }));

	const socialLinks = [
		{
			name: 'LinkedIn',
			icon: '/contacts/social-icon/linkedin.svg',
			href: 'https://www.linkedin.com/company/devxhub-ltd'
		},
		{
			name: 'GitHub',
			icon: '/contacts/social-icon/github.svg',
			href: 'https://github.com/devxhub'
		},
		{
			name: 'Facebook',
			icon: '/contacts/social-icon/facebook.svg',
			href: 'https://www.facebook.com/devxhubltd'
		},
		{
			name: 'YouTube',
			icon: '/contacts/social-icon/youtube.svg',
			href: 'http://youtube.com/@devxhub'
		},
		{ name: 'Twitter', icon: '/contacts/social-icon/twitter.svg', href: 'https://x.com/devxhub' }
	].map((social) => ({ ...social, icon: getAssetPath(social.icon) }));

	function getAssetPath(path: string) {
		return `${base}${path}`;
	}
</script>

<section>
	<div class="footerSectionDiv relative flex h-auto flex-col justify-end">
		<div class="footerSection relative bottom-0 w-full bg-[#1A1139]">
			<div class="mx-auto">
				<div class="relative pt-8 md:pt-10">
					<div class="flex flex-col gap-7 bg-[#120736] pt-[64px] md:pt-[30px]">
						<div
							class="container-fluid footer-top flex flex-col items-center justify-between gap-10 bg-[#120736] lg:flex-row lg:items-start lg:gap-0 lg:gap-x-10 xl:gap-x-17 2xl:gap-x-26"
						>
							<!-- Brand Section -->
							<div
								class="flex w-full flex-col justify-between gap-8 md:items-center md:gap-10 md:text-center lg:w-auto lg:items-start lg:text-left 2xl:w-auto"
							>
								<img class="h-[30px] w-[155px]" src="{base}{logoSrc}" alt="devxhub logo" />
								<div class="text-sm text-[#999] md:max-w-[193px] md:text-base">
									<p>A Leading Software Development Company</p>
								</div>
								<a
									href="https://www.devxhub.com/contact"
									aria-label="Contact Us Now"
									class="hero_section_carousal_aeonik w-[180px] rounded-full bg-[#FFD700] px-[29px] py-3 text-center font-medium text-[#1D1A20]"
								>
									Contact Us Now
								</a>
							</div>

							<!-- Company - Desktop -->
							<div
								class="hidden w-full text-center whitespace-nowrap md:flex md:flex-col md:items-center lg:w-auto lg:items-start lg:text-left"
							>
								<p class="mb-4 text-left text-base font-bold text-[#F1F1F2] uppercase">Company</p>
								<ul class="flex flex-col gap-3 text-[14px] text-[#999] md:text-base">
									{#each company as item (item.name)}
										<li
											class:flex={item.isDownload}
											class:items-center={item.isDownload}
											class:gap-x-[10px]={item.isDownload}
										>
											{#if item.isDownload}
												<button
													class="cursor-pointer text-left"
													onclick={item.onClick}
													type="button"
													aria-label="Download company profile"
												>
													{item.name}
												</button>
												<button
													onclick={item.onClick}
													type="button"
													aria-label="Download company profile"
													class="cursor-pointer"
												>
													<img
														src={getAssetPath('/images/icon-download.png')}
														alt="Download"
														class="h-6 w-6"
													/>
												</button>
											{:else}
												<a href={item.path}>{item.name}</a>
											{/if}
										</li>
									{/each}
								</ul>
							</div>

							<!-- Global Impact - Desktop -->
							<div
								class="hidden w-full flex-col text-center whitespace-nowrap md:flex lg:w-auto lg:items-start lg:text-left"
							>
								<p class="mb-4 text-base font-bold text-[#F1F1F2] uppercase">Global Impact</p>
								<ul class="flex flex-col gap-3 text-base text-[#999]">
									{#each globalImpact as item (item.name)}
										<li>
											<a href={item.path}>{item.name}</a>
										</li>
									{/each}
								</ul>
							</div>

							<!-- Collaboration - Desktop -->
							<div
								class="hidden w-full flex-col whitespace-nowrap md:flex md:items-center md:text-center lg:w-auto lg:items-start lg:text-left"
							>
								<p class="mb-4 text-left text-base font-bold text-[#F1F1F2] uppercase">
									Collaboration
								</p>
								<ul
									class="flex flex-col gap-3 text-left text-[14px] text-[#999] md:text-center md:text-base lg:text-left"
								>
									{#each collaboration as item (item.name)}
										<li><a href={item.path}>{item.name}</a></li>
									{/each}
								</ul>
							</div>

							<!-- Mobile: Company & Collaboration -->
							<div class="flex items-start justify-between gap-6 sm:gap-[59px] md:hidden">
								<div
									class="flex w-full flex-col text-left whitespace-nowrap md:items-center lg:w-auto lg:items-start lg:text-left"
								>
									<p class="mb-4 text-base font-bold text-[#F1F1F2] uppercase">Company</p>
									<ul class="flex flex-col gap-3 text-[14px] text-[#999]">
										{#each company as item (item.name)}
											<li
												class:flex={item.isDownload}
												class:items-center={item.isDownload}
												class:gap-x-[10px]={item.isDownload}
											>
												{#if item.isDownload}
													<button
														class="cursor-pointer text-left"
														onclick={item.onClick}
														type="button"
														aria-label="Download company profile"
													>
														{item.name}
													</button>
													<button
														onclick={item.onClick}
														type="button"
														aria-label="Download company profile"
														class="h-6 w-6 flex-shrink-0 cursor-pointer"
													>
														<img
															src={getAssetPath('/images/icon-download.png')}
															alt="Download"
															class="h-6 w-6"
														/>
													</button>
												{:else}
													<a href={item.path}>{item.name}</a>
												{/if}
											</li>
										{/each}
									</ul>
								</div>
								<div
									class="flex w-full flex-col items-start text-center md:whitespace-nowrap lg:w-auto lg:items-start lg:text-left"
								>
									<p class="mb-4 text-left text-base font-bold text-[#F1F1F2] uppercase">
										Collaboration
									</p>
									<ul class="flex flex-col gap-3 text-left text-[14px] text-[#999] md:text-base">
										{#each collaboration as item (item.name)}
											<li><a href={item.path}>{item.name}</a></li>
										{/each}
									</ul>
								</div>
							</div>

							<!-- Mobile: Global Impact -->
							<div
								class="flex w-full flex-col text-left md:hidden lg:w-auto lg:items-start lg:text-left"
							>
								<p class="mb-4 text-base font-bold text-[#F1F1F2] uppercase">Global Impact</p>
								<ul class="flex flex-col gap-3 text-[14px] text-[#999]">
									{#each globalImpact as item (item.name)}
										<li>
											<a href={item.path}>{item.name}</a>
										</li>
									{/each}
								</ul>
							</div>
						</div>

						<hr class="container-fluid h-0.5 border-[#ffffff1a]" />

						<!-- Addresses -->
						<div
							class="container-fluid !mt-[0px] flex w-full flex-col justify-between gap-10 md:items-center lg:flex-row lg:items-start lg:gap-0 lg:gap-x-10 xl:gap-x-17 2xl:gap-x-26"
						>
							{#each countryAddresses as address (address.name)}
								<div class="flex w-full flex-col md:items-center lg:w-auto lg:items-start">
									<div class="flex min-h-[41px] items-center">
										<img src={address.image} alt={address.name} />
									</div>
									<p class="mt-[4.65px] text-2xl font-bold text-[#F1F1F2]">{address.name}</p>
									<ul class="flex flex-col items-start">
										<li class="mt-[15px] flex items-start gap-x-[7px] text-[#999]">
											<img class="mt-1" src={getAssetPath('/contacts/address.svg')} alt="Address" />
											<div class="text-start">
												<p>{address.street}</p>
												<p>{address.country}</p>
											</div>
										</li>
										<li class="mt-[12px] flex gap-x-[7px] text-[#F1F1F2] md:items-center">
											<img src={getAssetPath('/contacts/call.svg')} alt="Phone" />
											<p>{address.number}</p>
										</li>
									</ul>
								</div>
							{/each}
						</div>

						<hr class="container-fluid h-0.5 border-[#ffffff1a]" />

						<!-- Bottom Section -->
						<div class="container-fluid !mt-0 bg-[#120736]">
							<div
								class="footer-bottom flex flex-col gap-[30px] text-center text-base font-normal text-[#999] min-[1100px]:flex-row min-[1100px]:justify-between min-[1100px]:gap-0 md:items-center md:pb-[30px]"
							>
								<!-- Desktop Copyright -->
								<div class="hidden items-center gap-4 md:flex md:flex-row md:items-start md:gap-0">
									<p class="leading-6">
										&copy; {currentYear},
										<span
											><a href={companyUrl} rel="noopener noreferrer" aria-label="Devxhub Limited"
												>{companyName},</a
											></span
										>
										All Rights Reserved.
									</p>
									<span class="hidden px-4 text-white md:block">|</span>
									<p class="mt-4 leading-6 md:mt-0">
										<a href="https://www.devxhub.com/privacy-policy">Privacy Policy</a>
										<span class="px-4 text-white">|</span>
										<a href="https://www.devxhub.com/terms-of-use">Terms of Use</a>
									</p>
								</div>

								<!-- Desktop Clutch & Social -->
								<div class="hidden flex-row items-center gap-12 md:flex">
									<div
										style="transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); opacity: 1; transform-style: preserve-3d;"
										class="clutch-badge-new flex h-10 max-w-[159px] items-center justify-start gap-x-1 rounded-full border border-[#999] bg-transparent px-5"
									>
										<img
											src={getAssetPath('/landing/clutch.svg')}
											loading="lazy"
											alt="clutch-logo"
											class="clutch-logo h-[12px] w-[43px]"
										/>
										<img
											src={getAssetPath('/landing/Star_1.svg')}
											loading="lazy"
											alt=""
											class="clutch_stars ml-1 h-[12px] w-[13px]"
										/>
										<div class="ml-1 text-sm font-medium text-[#f1f1f2]">5.0</div>
									</div>
									<div class="flex items-center gap-4">
										{#each socialLinks as social (social.name)}
											<a
												href={social.href}
												rel="noopener noreferrer"
												aria-label="Devxhub {social.name} Account"
											>
												<img
													class="social-icons"
													src={social.icon}
													alt="Devxhub {social.name} Icon"
												/>
											</a>
										{/each}
									</div>
								</div>

								<!-- Mobile Clutch & Social -->
								<div class="flex flex-col justify-items-start gap-9 md:hidden">
									<div
										style="transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); opacity: 1; transform-style: preserve-3d;"
										class="clutch-badge-new flex h-10 max-w-[130px] items-center justify-start gap-x-1 rounded-full border border-[#999] bg-transparent px-5"
									>
										<img
											src={getAssetPath('/landing/clutch.svg')}
											loading="lazy"
											alt="clutch-logo"
											class="clutch-logo h-[12px] w-[43px]"
										/>
										<img
											src={getAssetPath('/landing/Star_1.svg')}
											loading="lazy"
											alt=""
											class="clutch_stars ml-1 h-[12px] w-[13px]"
										/>
										<div class="text-sm font-medium text-[#f1f1f2]">5.0</div>
									</div>
									<div class="flex items-center gap-3">
										{#each socialLinks as social (social.name)}
											<a
												href={social.href}
												rel="noopener noreferrer"
												aria-label="Devxhub {social.name} Account"
											>
												<img
													class="social-icons"
													src={social.icon}
													alt="Devxhub {social.name} Icon"
												/>
											</a>
										{/each}
									</div>
								</div>

								<!-- Mobile Copyright -->
								<div class="flex flex-col items-start gap-[10px] text-[14px] md:hidden">
									<p class="leading-6">
										&copy; {currentYear},
										<span
											><a href={companyUrl} rel="noopener noreferrer" aria-label="Devxhub Ltd."
												>{companyName},</a
											></span
										>
										All Rights Reserved.
									</p>
									<span class="hidden px-4 text-white md:block">|</span>
									<p class="!mt-0">
										<a href="https://www.devxhub.com/privacy-policy">Privacy Policy</a>
										<span class="px-2.5 text-white">|</span>
										<a href="https://www.devxhub.com/terms-of-use">Terms of Use</a>
									</p>
								</div>
							</div>
						</div>

						<img class="container-fluid" src={getAssetPath('/landing/Footer_Devxhub.svg')} alt="" />
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Company Profile Modal -->
<CompanyProfileModal {showModal} onClose={closeModal} />

<style>
	.footer-bottom p,
	.footer-bottom p a,
	.footer-bottom p span a {
		font-family: 'Roboto', sans-serif;
	}

	.social-icons {
		width: 40px;
		height: 40px;
		aspect-ratio: 1;
		object-fit: contain;
	}

	@media (min-width: 1024px) and (max-width: 1200px) {
		.social-icons {
			width: 40px;
			height: 40px;
		}
	}

	.hero_section_carousal_aeonik {
		font-family: 'Roboto', sans-serif;
	}

	/* Footer link hover effects */
	:global(a) {
		transition: color 0.3s ease;
	}

	:global(a:hover) {
		color: #ffd700;
		text-decoration: underline;
	}

	/* Company profile download cursor */
	.cursor-pointer {
		cursor: pointer;
		transition: color 0.3s ease;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
	}

	.cursor-pointer:hover {
		color: #ffd700;
		text-decoration: underline;
	}
</style>
