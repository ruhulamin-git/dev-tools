<script lang="ts">
	import { base } from '$app/paths';
	import { getLiveTools } from '$lib/shared/config/tools';
	import { cubicInOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	interface Props {
		logoSrc?: string;
		mobileLogoSrc?: string;
		mainWebsiteUrl?: string;
	}

	const {
		logoSrc = '/devxhubicontop.svg',
		mobileLogoSrc = '/devxhub-logo.webp',
		mainWebsiteUrl = 'https://www.devxhub.com'
	}: Props = $props();

	let mobileMenuOpen = $state(false);
	let currentSubMenu = $state<string | null>(null);
	const liveTools = getLiveTools();
	const allTools = getLiveTools().sort((a, b) => a.priority - b.priority);

	const services = [
		{
			id: 1,
			name: 'IT Staff Augmentation',
			path: 'https://www.devxhub.com/it-staff-augmentation',
			icon: '/services/it-staff-augmentation.svg'
		},
		{
			id: 2,
			name: 'Full Stack Development',
			path: 'https://www.devxhub.com/full-stack-development',
			icon: '/services/full-stack-development.svg'
		},
		{
			id: 3,
			name: 'Mobile Application Development',
			path: 'https://www.devxhub.com/mobile-application-development',
			icon: '/services/mobile-application-development.svg'
		},
		{
			id: 4,
			name: 'Custom & Enterprise Software Development',
			path: 'https://www.devxhub.com/custom-software-development',
			icon: '/services/custom-software-development.svg'
		},
		{
			id: 5,
			name: 'MVP, SaaS, End-to-End Development',
			path: 'https://www.devxhub.com/mvp-saas-end-to-end-development',
			icon: '/services/mvp-saas-end-to-end-development.svg'
		},
		{
			id: 6,
			name: 'AI/ML Development & Integration',
			path: 'https://www.devxhub.com/ai-ml-development-integration',
			icon: '/services/ai-ml-development-integration.svg'
		},
		{
			id: 7,
			name: 'DevOps & Cloud Solutions',
			path: 'https://www.devxhub.com/devops-cloud-solutions',
			icon: '/services/devops-cloud-solutions.svg'
		}
	];

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
		if (!mobileMenuOpen) {
			currentSubMenu = null;
		}

		// Prevent body scroll when mobile menu is open
		if (typeof document !== 'undefined') {
			if (mobileMenuOpen) {
				document.body.classList.add('mobile-menu-open');
			} else {
				document.body.classList.remove('mobile-menu-open');
			}
		}
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
		currentSubMenu = null;

		// Re-enable body scroll
		if (typeof document !== 'undefined') {
			document.body.classList.remove('mobile-menu-open');
		}
	}

	function toggleSubMenu(menu: string) {
		currentSubMenu = currentSubMenu === menu ? null : menu;
	}

	// Custom transition for mobile menu - matches devxhub
	function menuTransition(node: HTMLElement, { delay = 0, duration = 600 }) {
		return {
			delay,
			duration,
			css: (t: number) => {
				const eased = cubicInOut(t);
				return `
					width: ${eased * 91 + (1 - eased) * 12.9}%;
					height: ${eased * 100 + (1 - eased) * 4.4}%;
					opacity: ${0.8 + eased * 0.2};
				`;
			}
		};
	}

	// FontAwesome arrow-up SVG path (fa-arrow-up) - exact match to devxhub
	const arrowUpPath =
		'M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z';
</script>

<div class="header bg-[#130C2A]">
	<div class="container-fluid bg-[#130C2A]">
		<div class="relative flex h-20 items-center justify-between py-3.5 md:py-7">
			<!-- Logo -->
			<a href={mainWebsiteUrl} class="h-[32px] w-[170px] md:h-[32px] md:w-[170px]">
				<img src="{base}{logoSrc}" alt="Devxhub Logo" />
			</a>

			<!-- Desktop Navigation -->
			<ul
				class="ml-4 hidden space-x-4 text-lg font-semibold text-white lg:flex lg:space-x-6 2xl:space-x-10"
			>
				<li class="group relative flex items-center">
					<div class="flex cursor-pointer items-center space-x-2">
						<a href="https://www.devxhub.com/services">Services</a>
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full bg-[#f1f1f2] text-black"
						>
							<svg
								class="h-4 w-4 rotate-180 transform text-sm transition-all duration-300 ease-in-out group-hover:rotate-0"
								fill="currentColor"
								viewBox="0 0 384 512"
								aria-hidden="true"
							>
								<path d={arrowUpPath} />
							</svg>
						</div>
					</div>
					<div
						class="absolute top-[56px] left-[130%] z-[1] flex h-0 min-w-[550px] -translate-x-1/2 flex-col overflow-hidden rounded-[10px] bg-[linear-gradient(145.09deg,#2a1e56_11.97%,#3d2c79_89.93%)] text-lg font-normal shadow-[6px_6px_8px_rgba(0,0,0,0.3)] transition-[height] duration-500 ease-in-out group-hover:block group-hover:h-[514px]"
					>
						<div class="flex w-full space-x-3 px-[25px] py-[30px]">
							<div class="services w-full">
								<ul class="w-full">
									{#each services as service (service.id)}
										<li class="border-b-[0.5px] border-[#ffffff1a] last:border-b-0">
											<a href={service.path} class="flex items-center py-[18px]">
												<span class="text-[#F1F1F2]" style="font-weight: 400; !important"
													>{service.name}</span
												>
											</a>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					</div>
				</li>
				<li class="flex items-center">
					<a
						href="https://www.devxhub.com/case-study"
						aria-label="Case Study"
						class="whitespace-nowrap">Case Study</a
					>
				</li>
				<li class="flex items-center">
					<a
						href="https://www.devxhub.com/our-process"
						aria-label="Our process"
						class="whitespace-nowrap">Our Process</a
					>
				</li>
				<li class="flex items-center">
					<a href="https://www.devxhub.com/blog" aria-label="Blog" class="whitespace-nowrap">Blog</a
					>
				</li>
				<li class="flex items-center">
					<a
						href="https://www.devxhub.com/contact"
						aria-label="Contact us"
						class="whitespace-nowrap">Contact us</a
					>
				</li>
				<li class="flex items-center">
					<a
						href="https://calendly.com/devxhub/15min"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Book a Free Call"
						class="hidden h-10 w-[150px] items-center justify-center rounded-full bg-[#FFD700] text-base font-normal whitespace-nowrap text-[#1D1A20] lg:flex"
					>
						Book a Free Call
					</a>
				</li>
			</ul>

			<!-- Mobile Menu Button -->
			<div class="relative lg:hidden">
				<button
					class="flex cursor-pointer items-center justify-center space-x-4 rounded-[100px] bg-[#FFD700] px-[21px] py-[7px] text-[#333333]"
					onclick={toggleMobileMenu}
					onkeydown={(e) => e.key === 'Enter' && toggleMobileMenu()}
					role="button"
					tabindex="0"
				>
					<!-- Hamburger Icon - exact devxhub style -->
					<div class="flex flex-col">
						<div class="h-[1px] w-6 border border-solid border-[#0e0f18]"></div>
						<div class="mt-1.5 h-[2px] w-6 border border-solid border-[#0e0f18]"></div>
					</div>
					<p class="text-lg">Menu</p>
				</button>

				<!-- Mobile Menu Panel -->
				{#if mobileMenuOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						class="mobile fixed top-[13px] right-[19px] max-h-[550px] w-[91%] overflow-y-auto rounded-[15px] py-3"
						transition:menuTransition={{ duration: 600 }}
						onclick={(e) => e.stopPropagation()}
					>
						<ul
							class="mx-5 flex flex-col overflow-hidden text-center text-sm font-medium whitespace-nowrap text-white md:text-base"
							in:fade={{ delay: 200, duration: 600 }}
							out:fade={{ duration: 300 }}
						>
							<div class="mt-4 flex w-full items-center justify-between">
								<img src="{base}{mobileLogoSrc}" alt="Devxhub Logo" class="h-[32px] w-[170px]" />
								<button
									class="flex items-center justify-center space-x-4 rounded-[100px] bg-white px-[21px] py-[7px] text-lg font-medium text-black"
									onclick={closeMobileMenu}
								>
									Close
								</button>
							</div>

							<li class="mt-[40px] flex flex-col border-b-[0.5px] border-[#FDB21D] py-4 text-left">
								<div
									class="flex cursor-pointer items-center justify-start space-x-2 {currentSubMenu ===
									'services'
										? 'text-[#FDB21D]'
										: 'text-white'}"
									onclick={() => toggleSubMenu('services')}
									onkeydown={(e) => e.key === 'Enter' && toggleSubMenu('services')}
									role="button"
									tabindex="0"
								>
									<span class="text-4xl font-medium">Services</span>

									<div
										class="flex h-5 w-5 items-center justify-center rounded-full bg-[#f1f1f2] text-black"
									>
										<!-- FontAwesome arrow-up icon for mobile -->
										<svg
											class="h-4 w-4 transform text-sm"
											style="transition: transform 0.3s ease-in-out; transform: {currentSubMenu ===
											'services'
												? 'rotate(180deg)'
												: 'rotate(0deg)'};"
											fill="currentColor"
											viewBox="0 0 384 512"
											aria-hidden="true"
										>
											<path d={arrowUpPath} />
										</svg>
									</div>
								</div>
								{#if currentSubMenu === 'services'}
									<ul
										class="flex flex-col overflow-hidden pt-4 pb-2 text-[16px] md:text-lg"
										transition:slide={{ duration: 300, easing: cubicInOut }}
									>
										{#each services as service (service.id)}
											<li class="flex items-center space-x-3 py-3">
												<a href={service.path} onclick={closeMobileMenu}
													><span>{service.name}</span></a
												>
											</li>
										{/each}
									</ul>
								{/if}
							</li>

							<li class="border-b-[0.5px] border-[#FDB21D] py-4 text-left">
								<a
									href="https://www.devxhub.com/case-study"
									onclick={closeMobileMenu}
									aria-label="Case Study"
									class="text-4xl font-medium">Case Study</a
								>
							</li>
							<li class="border-b-[0.5px] border-[#FDB21D] py-4 text-left">
								<a
									href="https://www.devxhub.com/our-process"
									onclick={closeMobileMenu}
									aria-label="Our Process"
									class="text-4xl font-medium">Our Process</a
								>
							</li>
							<li class="border-b-[0.5px] border-[#FDB21D] py-4 text-left">
								<a
									href="https://www.devxhub.com/blog"
									onclick={closeMobileMenu}
									aria-label="Blog"
									class="text-4xl font-medium">Blog</a
								>
							</li>
							<li class="border-b-[0.5px] border-[#FDB21D] py-4 text-left">
								<a
									href="https://www.devxhub.com/contact"
									onclick={closeMobileMenu}
									aria-label="Contact us"
									class="text-4xl font-medium">Contact us</a
								>
							</li>

							<li class="flex justify-center py-4">
								<a
									href="https://calendly.com/devxhub/15min"
									aria-label="Book a Free Call"
									target="_blank"
									rel="noopener noreferrer"
									onclick={closeMobileMenu}
									class="hero_section_carousal_aeonik flex h-10 w-full items-center justify-center rounded-full bg-[#FFD700] whitespace-nowrap text-[#1D1A20]"
								>
									Book a Free Call
								</a>
							</li>
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Spacer for fixed header -->
<div class="h-20"></div>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		z-index: 50;
		font-family: 'Roboto', sans-serif;
	}

	/* Navigation text styling */
	.header ul li a,
	.header ul li span {
		font-family: 'Roboto', sans-serif;
		font-weight: 600;
		letter-spacing: 0;
	}

	.mobile {
		background: linear-gradient(145.09deg, #2a1e56 11.97%, #3d2c79 89.93%);
		box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.3);
		border-radius: 10px;
	}

	/* Mobile menu text */
	.mobile ul li a,
	.mobile ul li span {
		font-family: 'Roboto', sans-serif;
	}

	.hero_section_carousal_aeonik {
		font-family: 'Roboto', sans-serif;
	}
</style>
