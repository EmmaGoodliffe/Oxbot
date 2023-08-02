<script lang="ts">
  import { comTypes, requiredComDetails } from "../functions/src/commitment";
  import type { Writable } from "svelte/store";
  import BorderGroup from "./lib/BorderGroup.svelte";

  export let comType: (typeof comTypes)[number];
  export let details: Writable<string[]>;
</script>

<BorderGroup>
  <div class="">
    {#each requiredComDetails[comType] as detail, i}
      <div class="my-2 flex justify-end items-center">
        <label for={detail} class="pr-4">{detail}</label>
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
</BorderGroup>
