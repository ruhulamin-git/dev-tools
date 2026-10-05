# Components Folder

This folder contains all reusable Svelte components organized by feature.

## Structure

```
components/
├── common/              # Common/shared components
│   ├── PageHeader.svelte
│   └── index.ts
├── color-picker/        # Color picker specific components (Home page)
│   ├── ColorPickerCanvas.svelte
│   ├── CurrentColorDisplay.svelte
│   ├── ColorFormats.svelte
│   ├── ContrastChecker.svelte
│   ├── ColorHistory.svelte
│   ├── ColorHarmonies.svelte
│   ├── TintsAndShades.svelte
│   ├── QuickLinks.svelte
│   └── index.ts
├── gradient/            # Gradient page components
│   ├── GradientPreview.svelte
│   ├── GradientStopsTrack.svelte
│   ├── StopControls.svelte
│   ├── GradientSettings.svelte
│   ├── CSSCodeDisplay.svelte
│   ├── GradientPresets.svelte
│   └── index.ts
├── palette/             # Palette page components
│   ├── BaseColorPicker.svelte
│   ├── HarmonySelector.svelte
│   ├── PaletteDisplay.svelte
│   ├── ExportOptions.svelte
│   ├── PalettePreview.svelte
│   └── index.ts
├── shades/              # Shades page components
│   ├── ColorControls.svelte
│   ├── ColorGrid.svelte
│   └── index.ts
├── named-colors/        # Named colors page components
│   ├── ColorFilters.svelte
│   ├── NamedColorGrid.svelte
│   └── index.ts
└── index.ts             # Main export file
```

## Component Descriptions

### Common Components

- **PageHeader**: Reusable page header with title and description

### Color Picker Components (Home Page)

- **ColorPickerCanvas**: Main color picker with saturation/brightness canvas, hue slider, and alpha control
- **CurrentColorDisplay**: Shows the currently selected color with copy functionality
- **ColorFormats**: Displays color values in different formats (HEX, RGB, RGBA, HSL, HSLA, CMYK)
- **ContrastChecker**: WCAG contrast ratio checker with accessibility compliance indicators
- **ColorHistory**: Recent colors history with selection and clear functionality
- **ColorHarmonies**: Analogous color palette generator
- **TintsAndShades**: Color tints (lighter) and shades (darker) generator
- **QuickLinks**: Navigation links to other color tools

### Gradient Page Components

- **GradientPreview**: Preview area with click-to-copy CSS functionality
- **GradientStopsTrack**: Interactive color stops track with handles
- **StopControls**: Controls for editing selected gradient stop color and position
- **GradientSettings**: Gradient type toggle (linear/radial) and angle control
- **CSSCodeDisplay**: CSS code display with copy button
- **GradientPresets**: Grid of preset gradients

### Palette Page Components

- **BaseColorPicker**: Base color selection with color picker and hex input
- **HarmonySelector**: Harmony type selector (complementary, analogous, triadic, etc.)
- **PaletteDisplay**: Large palette display grid with copy functionality
- **ExportOptions**: Export buttons for CSS variables, JSON, and navigation
- **PalettePreview**: Preview palette in different UI contexts (cards, charts, alerts)

### Shades Page Components

- **ColorControls**: Base color picker with quantity slider and format selector
- **ColorGrid**: Reusable grid for displaying tints or shades with copy functionality

### Named Colors Page Components

- **ColorFilters**: Search, family filter, and sort controls
- **NamedColorGrid**: Grid of named color cards with copy functionality

## Statistics

- **Total Components**: 23
- **Total Lines Reduced**: 1,259 lines (57% reduction)
- **All components use inline CSS** ✅
- **TypeScript type safety** ✅
- **Svelte 5 runes** ✅

## Best Practices

1. **Inline CSS**: All components use inline CSS in `<style>` blocks following Svelte best practices
2. **Props Interface**: Each component defines a TypeScript `Props` interface for type safety
3. **Event Handlers**: Components accept event handler functions as props (e.g., `onCopy`, `onSelectColor`)
4. **Reactive State**: Components use Svelte 5's `$state`, `$derived`, and `$bindable` runes where appropriate
5. **Accessibility**: All components include proper ARIA labels and semantic HTML
6. **Reusability**: Components are designed to be reusable across different pages

## Usage Example

```svelte
<script lang="ts">
	import { ColorPickerCanvas, ColorFormats } from '$lib/components/color-picker';
	import { PageHeader } from '$lib/components/common';

	let selectedColor = $state('#3B82F6');
	// ... other state and logic
</script>

<PageHeader title="My Page" description="Page description" />

<ColorPickerCanvas bind:hue {selectedColor} {pureHueColor} onPickerMouseDown={handleMouseDown} />
```

## Maintenance

When adding new components:

1. Create the component in the appropriate folder
2. Add it to the folder's `index.ts` export file
3. Update this README with the component description
4. Follow the established patterns for props, events, and styling
