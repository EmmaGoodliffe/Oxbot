<script lang="ts">
  import { fly } from "svelte/transition";
  import { quartInOut } from "svelte/easing";
  import type { Writable } from "svelte/store";
  import type { NotificationPayload } from "firebase/messaging";

  export let toasts: Writable<NotificationPayload[]>;
</script>

<div
  class="h-0 sticky top-4 right-4 ml-auto max-w-[75%] md:max-w-md flex flex-col items-end"
>
  {#each $toasts as toast, i}
  <!-- TODO: sound -->
  <!-- TODO: handle `toast.icon and `toast.image` -->
  <!-- TODO: fix transition for dismissing the first of multiple -->
  <!-- TODO: use less hacky CSS -->
    <div
      class="mb-4 px-4 py-2 bg-slate-800 rounded"
      transition:fly={{ y: 20, easing: quartInOut }}
    >
      <div class="py-0.5 flex justify-between">
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
