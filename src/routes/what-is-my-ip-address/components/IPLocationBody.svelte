<script lang="ts">
    import { Button, Input, Label } from "$lib/shared/components/ui";
    import { CopyButton } from "$lib/shared/components";
    import { toast } from "$lib/shared/stores/toastStore";
    import {
        isValidIP,
        isPrivateIP,
        getIPTypeDescription,
    } from "../utils/ipValidator";
    import {
        fetchIPLocation,
        detectUserIP,
        formatLocationData,
        type IPLookupResult,
    } from "../utils/ipApi";

    let inputIP = $state("");
    let isLoading = $state(false);
    let isAutoDetecting = $state(false);
    let lookupResult = $state<IPLookupResult | null>(null);
    let autoDetectedResult = $state<IPLookupResult | null>(null);
    let validationError = $state("");
    let hasManualLookup = $state(false);

    $effect(() => {
        const timer = setTimeout(() => {
            detectUserIPOnLoad();
        }, 500);
        
        return () => clearTimeout(timer);
    });

    async function detectUserIPOnLoad() {
        isAutoDetecting = true;
        
        try {
            const result = await detectUserIP();
            autoDetectedResult = result;
            
            if (!hasManualLookup) {
                lookupResult = result;
            }
            
            if (result.success) {
                console.log("Auto-detected IP successfully");
            } else {
                console.warn("Auto-detection failed:", result.error);
            }
        } catch (error) {
            console.error("Auto-detection error:", error);
            autoDetectedResult = {
                success: false,
                error: "Auto-detection temporarily unavailable. Please use manual lookup."
            };
            
            if (!hasManualLookup) {
                lookupResult = autoDetectedResult;
            }
        } finally {
            isAutoDetecting = false;
        }
    }

    function validateInput(): boolean {
        validationError = "";
        
        if (!inputIP.trim()) {
            validationError = "Please enter an IP address";
            return false;
        }

        if (!isValidIP(inputIP.trim())) {
            validationError = "Please enter a valid IPv4 or IPv6 address";
            return false;
        }

        return true;
    }

    async function handleLookup() {
        if (!validateInput()) {
            return;
        }

        const ip = inputIP.trim();
        
        if (isPrivateIP(ip)) {
            lookupResult = {
                success: false,
                error: "Private IP — location data not available",
                isPrivate: true
            };
            hasManualLookup = true;
            return;
        }

        isLoading = true;
        hasManualLookup = true;

        try {
            const result = await fetchIPLocation(ip);
            lookupResult = result;
            
            if (result.success) {
                toast.success("IP location data retrieved successfully!");
            } else {
                toast.error(result.error || "Failed to lookup IP location");
            }
        } catch (error) {
            console.error("Lookup error:", error);
            lookupResult = {
                success: false,
                error: "An unexpected error occurred. Please try again."
            };
            toast.error("Failed to lookup IP location");
        } finally {
            isLoading = false;
        }
    }

    function handleReset() {
        inputIP = "";
        validationError = "";
        hasManualLookup = false;
        
        if (autoDetectedResult) {
            lookupResult = autoDetectedResult;
        } else {
            lookupResult = null;
        }
    }

    async function retryAutoDetection() {
        await detectUserIPOnLoad();
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === "Enter" && !isLoading) {
            handleLookup();
        }
    }

    let formattedData = $derived(lookupResult?.success && lookupResult.data 
        ? formatLocationData(lookupResult.data, !hasManualLookup && autoDetectedResult?.success)
        : null);

    let resultText = $derived(formattedData 
        ? Object.entries(formattedData)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
        : '');

    let isShowingAutoDetected = $derived(!hasManualLookup && autoDetectedResult?.success);
</script>

<div
    class="rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-xl sm:p-6 dark:border-slate-700 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
>
    <!-- Auto-Detection Status -->
    {#if isAutoDetecting}
        <div class="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div class="flex items-center space-x-3">
                <svg
                    class="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
                <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Auto-detecting your IP address...
                </span>
            </div>
        </div>
    {:else if autoDetectedResult && !autoDetectedResult.success && !hasManualLookup}
        <div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div class="flex items-start justify-between">
                <div class="flex items-start space-x-3">
                    <svg
                        class="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                    <div>
                        <h4 class="font-medium text-yellow-800 dark:text-yellow-200">
                            Auto-detection temporarily unavailable
                        </h4>
                        <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                            {autoDetectedResult.error}
                        </p>
                        <p class="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                            Try entering an IP address manually below, or use one of the example IPs.
                        </p>
                    </div>
                </div>
                <Button
                    onclick={retryAutoDetection}
                    variant="secondary"
                    size="sm"
                    class="ml-3"
                >
                    Retry
                </Button>
            </div>
        </div>
    {/if}

    <!-- Input Section -->
    <div class="mb-6 space-y-3">
        <Label
            htmlFor="ip-input"
            class="text-base font-semibold text-slate-900 dark:text-slate-100"
        >
            IP Address
        </Label>
        <div class="space-y-2 mt-2">
            <Input
                id="ip-input"
                bind:value={inputIP}
                placeholder="Enter IP address (e.g., 8.8.8.8 or 1.1.1.1)"
                class="font-mono text-sm text-slate-900 dark:text-slate-100"
                onkeydown={handleKeyPress}
                ariaDescribedby={validationError ? "ip-error" : undefined}
            />
            {#if validationError}
                <p id="ip-error" class="text-sm text-red-600 dark:text-red-400" role="alert">
                    {validationError}
                </p>
            {/if}
            {#if inputIP && isValidIP(inputIP.trim())}
                <p class="text-sm text-slate-600 dark:text-slate-400">
                    Type: {getIPTypeDescription(inputIP.trim())}
                </p>
            {/if}
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-6 flex flex-wrap gap-3">
        <Button
            onclick={handleLookup}
            disabled={isLoading || !inputIP.trim()}
            class="flex-1 sm:flex-none"
        >
            {#if isLoading}
                <svg
                    class="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
                Looking up...
            {:else}
                <svg
                    class="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                Lookup
            {/if}
        </Button>

        <Button
            onclick={handleReset}
            variant="secondary"
            class="flex-1 sm:flex-none"
        >
            <svg
                class="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
            </svg>
            Reset
        </Button>
    </div>

    <!-- Results Section -->
    {#if lookupResult}
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {lookupResult.success ? "Location Information" : "Lookup Result"}
                    </h2>
                    {#if isShowingAutoDetected}
                        <span class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Auto Detected
                        </span>
                    {:else if hasManualLookup}
                        <span class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            Manual Lookup
                        </span>
                    {/if}
                </div>
                {#if lookupResult.success && resultText}
                    <CopyButton
                        text={resultText}
                        label="Copy All Data"
                        variant="secondary"
                        size="sm"
                        successMessage="Location data copied to clipboard!"
                    />
                {/if}
            </div>

            {#if lookupResult.success && formattedData}
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <div class="grid gap-3 sm:grid-cols-2">
                        {#each Object.entries(formattedData) as [key, value]}
                            <div class="flex flex-col space-y-1">
                                <span class="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {key}
                                </span>
                                <span class="font-mono text-sm text-slate-900 dark:text-slate-100">
                                    {value}
                                </span>
                            </div>
                        {/each}
                    </div>
                </div>
            {:else}
                <div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                    <div class="flex items-start space-x-3">
                        <svg
                            class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                        <div>
                            <h4 class="font-medium text-red-800 dark:text-red-200">
                                {lookupResult.isPrivate ? "Private IP Address" : "Lookup Failed"}
                            </h4>
                            <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                                {lookupResult.error}
                            </p>
                            {#if lookupResult.isPrivate}
                                <p class="mt-2 text-sm text-red-600 dark:text-red-400">
                                    Private IP addresses (like 192.168.x.x, 10.x.x.x, 127.x.x.x) are used within local networks and don't have public geographic locations.
                                </p>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}

    <!-- Example IPs -->
    {#if !lookupResult && !isAutoDetecting}
        <div class="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <h4 class="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                Example IP Addresses to Try:
            </h4>
            <div class="flex flex-wrap gap-2">
                {#each ["8.8.8.8", "1.1.1.1", "208.67.222.222"] as exampleIP}
                    <button
                        type="button"
                        onclick={() => { inputIP = exampleIP; }}
                        class="rounded bg-slate-200 px-2 py-1 text-sm font-mono text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                        {exampleIP}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
