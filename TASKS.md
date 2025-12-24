Task: 1

Define new purple color scale variants in the CSS custom properties system to
support decorative use cases.

In `app/globals.css`:
- Add `--primary-light: oklch(0.75 0.20 280)` and `--primary-dark: oklch(0.40
0.28 280)` custom properties to `:root` selector
- Add corresponding foreground properties `--primary-light-foreground` and
`--primary-dark-foreground` with appropriate contrast colors
- Position new properties after existing `--primary` and `--primary-foreground`
definitions
- Map new variants to Tailwind theme in `@theme inline` block:
`--color-primary-light`, `--color-primary-dark`, and their foreground
counterparts
- Follow existing pattern used for primary, secondary, and accent color mappings
===============================================================================

Task: 2

Update difficulty badge component to use purple color variants instead of
green/yellow/red.

In `components/dificulty-badge.tsx`:
- Update `difficultyColors` Record mapping:
  - `easy`: change from `"bg-green-400"` to `"bg-primary-light text-foreground"`
- `medium`: change from `"bg-yellow-400"` to `"bg-primary
text-primary-foreground"`
  - `hard`: change from `"bg-red-400"` to `"bg-primary-dark text-white"`
- Ensure class application logic with `cn()` utility works correctly with new
classes
- Verify text contrast and accessibility with purple backgrounds