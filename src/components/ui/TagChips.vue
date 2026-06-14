<template>
  <div
    v-if="chips.length"
    class="vbwd-tag-chips"
    data-testid="tag-chips"
  >
    <span
      v-for="chip in chips"
      :key="chip.slug"
      class="vbwd-tag-chip"
      :style="chip.color ? { backgroundColor: chip.color } : undefined"
      data-testid="tag-chip"
    >
      {{ chip.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TagChip } from './types';

const props = withDefaults(defineProps<{
  tags?: Array<string | TagChip> | null;
}>(), {
  tags: () => [],
});

const chips = computed<TagChip[]>(() =>
  (props.tags ?? []).map((tag) =>
    typeof tag === 'string'
      ? { slug: tag, name: tag, color: null }
      : { slug: tag.slug, name: tag.name ?? tag.slug, color: tag.color ?? null },
  ),
);
</script>

<style scoped>
.vbwd-tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.vbwd-tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  background-color: var(--vbwd-color-secondary-light, #f3f4f6);
  color: var(--vbwd-color-secondary-dark, #374151);
}
</style>
