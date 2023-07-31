<script lang="ts">
  import { quartInOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import type { NotificationPayload } from "firebase/messaging";
  import type { Writable } from "svelte/store";
  import { onMount } from "svelte";
  import type { P } from "./types";

  export let toasts: Writable<NotificationPayload[]>;

  let el: null | (P & HTMLElement) = null;

  onMount(() => {
    el = document.querySelector("#toasts") as P & HTMLElement;
    el.popover = "manual";
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
</script>

<div class="max-w-sm h-screen mx-1 px-1 bg-transparent" id="toasts">
  <!-- class="h-0 sticky top-4 right-4 ml-auto max-w-[75%] md:max-w-md flex flex-col items-end" -->
  {#each $toasts as toast, i}
    <!-- TODO: sound -->
    <!-- TODO: handle `toast.icon and `toast.image` -->
    <!-- TODO: fix transition for dismissing the first of multiple -->
    <div
      class="mb-4 px-4 py-3 bg-dark-bg text-text rounded"
      transition:fly={{ y: 20, easing: quartInOut }}
    >
      <div class="flex justify-between items-center">
        <header class=" font-bold">{toast.title ?? ""}</header>
        <button
          class="pl-4 text-lg"
          on:click={() => {
            toasts.update(t => {
              t.splice(i, 1);
              return t;
            });
          }}>&times;</button
        >
      </div>
      {#if toast.body}
        <p class="mt-1">{toast.body}</p>
      {/if}
    </div>
  {/each}
</div>

<style lang="postcss">
  #toasts {
    inset: unset;
    top: 0;
    right: 0;
  }
</style>
