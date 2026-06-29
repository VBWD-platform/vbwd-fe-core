<template>
  <span
    class="vbwd-icon"
    :data-icon="name"
    aria-hidden="true"
    v-html="svg"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { resolveIconPath } from './icons';

/**
 * Generic inline-SVG icon. Renders a stroke-based 24x24 icon by name from the
 * shared registry (see ./icons.ts). Colour follows `currentColor` so the icon
 * inherits the surrounding text colour — no per-icon theming needed.
 *
 * Unknown names fall back to a neutral dot, so a missing icon never breaks a
 * layout. Names are domain-agnostic; plugins map their concept onto a generic
 * name (e.g. 'sparkles', 'git-branch').
 */
const props = withDefaults(
  defineProps<{
    /** Icon name from the registry (e.g. 'dashboard', 'users', 'invoice'). */
    name: string;
    /** Pixel size of the square icon. */
    size?: number | string;
    /** SVG stroke width. */
    strokeWidth?: number | string;
  }>(),
  {
    size: 18,
    strokeWidth: 2,
  },
);

const svg = computed((): string => {
  const inner = resolveIconPath(props.name);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${props.size}" height="${props.size}" ` +
    `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${props.strokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
  );
});
</script>

<style scoped>
.vbwd-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}
</style>
