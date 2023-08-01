<script lang="ts">
  export let title: string;
  export let show = false;
  export let close: () => void;

  $: {
    const el = document.querySelector("dialog");
    if (show) {
      el?.showModal();
    } else {
      el?.close();
    }
  }
</script>

<dialog>
  <div class="flex justify-between items-center">
    <header class="text-xl font-bold">{title}</header>
    <button class="ml-4 text-2xl" on:click={() => close()}>&times;</button>
  </div>
  <slot />
</dialog>
