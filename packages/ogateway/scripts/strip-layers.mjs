// Tailwind compiles our CSS into named cascade layers (@layer theme/properties/utilities).
// That's fine standalone, but once this file sits inside a host app that *also* uses
// Tailwind v4, both stylesheets register layers by the same names and the merged layer
// order is decided by whichever app's <style> tag happened to load first — our utilities
// can end up losing to the host's own Preflight reset (padding/border silently drop to 0).
//
// Unlayered CSS always beats layered CSS of equal specificity, per the Cascade Layers
// spec, regardless of load order. So: strip the @layer wrappers, keep their contents.
import { readFileSync, writeFileSync } from 'node:fs';

const file = process.argv[2];
let css = readFileSync(file, 'utf8');

// Drop the bare layer-order statement, e.g. `@layer theme, properties, utilities;`
css = css.replace(/@layer\s+[\w\s,-]+;/g, '');

// Repeatedly unwrap `@layer <name>{ ... }`, keeping the inner content, until none remain
// (handles nesting, e.g. `@supports (...) { @layer properties { ... } }`).
const layerStart = /@layer\s+[\w-]+\s*\{/;
for (let match = css.match(layerStart); match; match = css.match(layerStart)) {
  const openBrace = match.index + match[0].length - 1;
  let depth = 1;
  let i = openBrace + 1;
  for (; i < css.length && depth > 0; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
  }
  const closeBrace = i - 1;
  css = css.slice(0, match.index) + css.slice(match.index + match[0].length, closeBrace) + css.slice(closeBrace + 1);
}

writeFileSync(file, css);
