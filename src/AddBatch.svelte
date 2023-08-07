<script lang="ts">
  import { checkCom } from "./schemas";

  let text = "";
  let json: unknown;
  let status: string[] | true = [""];

  $: {
    try {
      json = JSON.parse(text);
    } catch (err) {
      status = ["Invalid JSON"];
    }
    if (json instanceof Array) {
      if (json.length) {
        const validities = json.map(obj => checkCom(obj));
        const allValid = validities.every(v => v === true);
        if (allValid) {
          status = true;
        } else {
          status = validities
            .map((v, i) =>
              v === true
                ? ""
                : v.map(
                    e =>
                      `${e.keyword} error at ${
                        e.instancePath || "/"
                      } in [${i}]: ${e.message} (${JSON.stringify(e.params)})`
                  )
            )
            .flat();
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
    <code class="my-1">{s}</code>
  {/each}
{/if}
