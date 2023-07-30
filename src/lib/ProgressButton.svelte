<script lang="ts">
  import { delay } from "./db";
  import type { Writable } from "svelte/store";

  export let text: string;
  export let valid: boolean;
  export let a: Writable<number>;
  export let b: Writable<number>;
  export let refresh: () => Promise<unknown>;
  export let write: () => Promise<void>;

  let inProgress = false;
  let transparent = false;
</script>

<div class="submit mt-8">
  <div class="loader">
    <div
      class="progress"
      style:width="{$a}%"
      style:opacity={transparent ? 0 : 1}
    />
  </div>
  <button
    class="mx-4 button"
    disabled={inProgress || !valid}
    on:click={async () => {
      inProgress = true;
      await write();
      await delay(2 * 0.6);
      transparent = true;
      await delay(0.6);
      a.set(0);
      b.set(0);
      await delay(0.6);
      transparent = false;
      inProgress = false;
      await refresh();
    }}>{text}</button
  >
  <div class="loader">
    <div
      class="progress"
      style:width="{$b}%"
      style:opacity={transparent ? 0 : 1}
    />
  </div>
</div>

<style lang="postcss">
  .submit {
    @apply w-full flex justify-between items-center;
  }

  .loader {
    @apply h-2 flex-1 bg-light-bg rounded-sm;
  }

  .progress {
    @apply h-full bg-hov transition-all duration-300;
  }
</style>
