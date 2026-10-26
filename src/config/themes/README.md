# Site theme

The active design lives in `shop-violet.json`. Edit its `light`/`dark` color values, `typography` font stacks and text metrics, `fontWeights`, or `radii`; the root layout publishes those values as CSS variables consumed by Tailwind across the site.

The current font is Inter, with the existing Geist font and system sans fonts as fallbacks. GT Standard is not bundled with the project, so add licensed font files and use `next/font/local` if you have that typeface. You can also change `fontSans` in the JSON to any system or locally loaded family.
