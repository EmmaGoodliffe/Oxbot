<script lang="ts">
  import { getJsonCommitmentValidity } from "../functions/src/commitment";

  let text = "";
  let json: unknown;
  let status: string[] | true = [""];

  $: {
    try {
      json = JSON.parse(text);
    } catch (err) {
      status = ["Invalid JSON"];
    }
  }

  $: {
    if (json instanceof Array) {
      if (json.length) {
        const validities = json.map(obj => getJsonCommitmentValidity(obj));
        const allValid = validities.every(v => v === true);
        if (allValid) {
          status = true;
        } else {
          status = validities
            .map((v, i) => ({ v, i }))
            .filter(({ v }) => v !== true)
            .map(({ v, i }) =>
              v ? `Invalid ${v} property on [${i}]` : `Invalid [${i}]`
            );
        }
      } else {
        status = ["Empty"];
      }
    } else {
      status = ["Expected an array"];
    }
  }
</script>

<textarea
  name="add-batch"
  id="add-batch"
  cols="30"
  rows="10"
  bind:value={text}
/>
<!-- TODO: format button -->
{#if status === true}
  <p>valid</p>
{:else}
  {#each status as s}
    <code>{s}</code>
  {/each}
{/if}
