<script lang="ts">
  import { comTypes, requiredComDetails } from "../functions/src/commitment";
  import type { Writable } from "svelte/store";

  export let comType: (typeof comTypes)[number];
  export let details: Writable<string[]>;
</script>

<!-- TODO: fix overflow -->
<div
  class="w-fit h-14 mt-4 pr-4 flex items-center border-2 border-light-border rounded"
>
  {#each requiredComDetails[comType] as detail, i}
    <label for={detail} class="px-4">{detail}</label>
    <input
      type="text"
      id={detail}
      value={$details[i] ?? ""}
      on:input={e =>
        details.update(ds => {
          ds[i] = e.currentTarget.value;
          return ds;
        })}
    />
  {/each}
</div>
