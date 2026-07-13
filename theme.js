// Theme tokens — derived from the reference stylesheets in styles/reference/
// (normalize.css, skeleton.css, custom.css):
//
//   bg      #242424            custom.css  `html { background-color: #242424 }`
//   surface #28292c            custom.css  `:root { --dark: #28292c }`
//   text    #cccccc            custom.css  `body { color: #cccccc }`
//   muted   #999999            custom.css  `.heading-font-size { color: #999 }`
//   cyan    #33C3F0            skeleton.css `.button-primary` / custom.css `.navbar-link.active`
//   green   rgb(27,129,112)    custom.css  `:root { --link }`
//   gold    #ffc107            custom.css  toggle checked knob gradient end
//   blue    rgb(108,159,213)   custom.css  `.navbar { background }`
//
// The remaining accents (magenta/orange/purple) aren't in the reference files;
// they're chosen to sit alongside that palette on the dark background.

export const colors = {
  // Backgrounds & surfaces
  bg:           "#242424",
  surface:      "#28292c",
  surfaceLight: "#2f3034",
  border:       "#3d3e42",

  // Text
  text:         "#cccccc",
  muted:        "#999999",

  // Accents
  cyan:         "#33C3F0",
  magenta:      "#e0568a",
  gold:         "#ffc107",
  green:        "#1b8170",
  orange:       "#e8944a",
  purple:       "#9d8bd6",
  blue:         "#6c9fd5",

  // Grid overlay (used in SVG plots)
  grid:         "rgba(200, 205, 215, 0.08)",
  gridAxis:     "rgba(210, 215, 225, 0.28)",
};

export const fonts = {
  mono: "'IBM Plex Mono', monospace, monospace",
};

// Maps color names used in :::callout, :::takehome directives to hex values.
export const accentMap = {
  cyan:    colors.cyan,
  magenta: colors.magenta,
  gold:    colors.gold,
  green:   colors.green,
  orange:  colors.orange,
  purple:  colors.purple,
  blue:    colors.blue,
  muted:   colors.muted,
};
