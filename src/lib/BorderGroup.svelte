<script lang="ts">
  export let withRight = false;
</script>

<div class="border-group">
  <div class="side" class:side-borders={withRight}>
    <slot>default left</slot>
  </div>
  {#if withRight}
    <div class="side">
      <slot name="right" />
    </div>
  {/if}
</div>

<style lang="postcss">
  .border-group {
    @apply w-fit my-4 flex flex-col sm:flex-row border-2 border-light-border rounded;
  }

  .border-group .side {
    @apply flex-1 px-4 py-2;
  }

  .border-group .side.side-borders {
    @apply border-b-2 sm:border-b-0 sm:border-r-2 border-light-border;
  }
</style>
