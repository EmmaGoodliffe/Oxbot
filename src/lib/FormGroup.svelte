<script lang="ts">
  export let withRight = false;
</script>

<div class="form-group">
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
  .form-group {
    @apply w-fit mt-8 flex flex-col sm:flex-row border-2 border-light-border rounded;
  }

  .form-group .side {
    @apply flex-1 px-4 py-2;
  }

  .form-group .side.side-borders {
    @apply border-b-2 sm:border-b-0 sm:border-r-2 border-light-border;
  }
</style>
