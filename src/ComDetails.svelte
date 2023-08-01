<script lang="ts">
  import { comTypes, requiredComDetails } from "../functions/src/commitment";
  import type { Writable } from "svelte/store";

  export let comType: (typeof comTypes)[number];
  export let details: Writable<string[]>;
</script>

<div
  class="w-fit min-h-[3.5rem] mt-4 pr-4 flex flex-col items-end border-2 border-light-border rounded"
>
  {#each requiredComDetails[comType] as detail, i}
    <div class="my-2 flex items-center">
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
    </div>
  {/each}
</div>
