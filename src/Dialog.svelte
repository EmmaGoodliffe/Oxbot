<script lang="ts">
  export let title: string;
  export let onClose: () => void;

  const closeDialog = () => {
    console.log("closing");
    document.querySelector("dialog")?.close();
  };
</script>

<dialog on:close={onClose}>
  <div class="mb-4 flex justify-between items-center">
    <header class="text-xl font-bold">{title}</header>
    <button class="ml-4 text-2xl" on:click={closeDialog}>&times;</button>
  </div>
  <slot />
</dialog>

<style lang="postcss">
  dialog {
    @apply w-5/6 md:w-2/3 px-8 py-4 bg-bg text-text border-light-border border-4 rounded;
  }
</style>
