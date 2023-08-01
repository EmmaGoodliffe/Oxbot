<script lang="ts">
  import { quartInOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import type { Writable } from "svelte/store";
  import { onDestroy, onMount, tick } from "svelte";
  import type { P } from "./types";
  import type { Toast } from "./lib/toast";

  export let toasts: Writable<Toast[]>;

  let el: null | (P & HTMLElement) = null;
  let unsubscribe: ReturnType<Writable<unknown>["subscribe"]>;
  let heightStyles: string[] = [];

  onMount(() => {
    el = document.querySelector("#toasts") as P & HTMLElement;
    el.popover = "manual";
    unsubscribe = toasts.subscribe(async ts => {
      await tick();
      updateHeights(ts);
    });
  });

  onDestroy(() => {
    unsubscribe();
  });

  $: {
    if (el !== null) {
      if ($toasts.length) {
        el.showPopover();
      } else {
        el.hidePopover();
      }
    }
  }

  const updateHeights = (ts: Toast[]) => {
    heightStyles = ts.map((t, i) => {
      const h = document.querySelector(`#toast-${i}`)?.clientHeight;
      return h ? `${h}px` : "auto";
    });
    console.count("Updated toast styles");
  };
</script>

<div
  class="left-auto right-0 top-0 max-w-sm h-screen mx-1 px-1 bg-transparent overflow-x-hidden"
  id="toasts"
>
  {#each $toasts as toast, i (i)}
    <!-- TODO: sound -->
    <!-- TODO: handle `toast.icon and `toast.image` -->
    <div
      class="transition-all duration-1000"
      style="height: {toast.visible
        ? heightStyles[i]
        : '0px'}; margin-bottom: {toast.visible ? '1rem' : '0rem'}"
    >
      {#if toast.visible}
        <div
          class="px-4 py-3 bg-dark-bg text-text rounded"
          id="toast-{i}"
          transition:fly={{ x: 20, easing: quartInOut }}
        >
          <div class="flex justify-between items-center">
            <header class=" font-bold">{toast.not.title ?? ""}</header>
            <button
              class="ml-4 text-lg"
              on:click={() => {
                toasts.update(t => {
                  t[i].visible = false;
                  return t;
                });
              }}>&times;</button
            >
          </div>
          {#if toast.not.body}
            <p class="mt-1">{toast.not.body}</p>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  /* #toasts {
    inset: unset;
    top: 0;
    right: 0;
  } */
</style>
