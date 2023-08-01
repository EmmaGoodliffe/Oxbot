<script lang="ts">
  export let title: string;
  export let onClose: () => void;

  const closeDialog = () => {
    console.log("closing");
    document.querySelector("dialog")?.close();
  };
</script>

<dialog on:close={onClose}>
  <div class="flex justify-between items-center">
    <header class="text-xl font-bold">{title}</header>
    <button class="ml-4 text-2xl" on:click={closeDialog}>&times;</button>
  </div>
  <slot  />
</dialog>
