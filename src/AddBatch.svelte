<script lang="ts">
  import { writable } from "svelte/store";
  import ProgressButton from "./lib/ProgressButton.svelte";
  import { checkBatch } from "./schemas";
  import { addBatchedCommitments } from "./lib/db";
  import type { Firestore } from "firebase/firestore";

  export let db: Firestore;
  export let refresh: () => Promise<unknown>;

  let text = "";
  let errors: string[] = [""];
  const a = writable(0);
  const b = writable(0);

  type E = Exclude<ReturnType<typeof checkBatch>, boolean>[number];

  const sortSchemaErrors = (es: E[]) => {
    const requiredErrors = es.filter(e => e.keyword === "required");
    const anyOfErrors = es.filter(e => e.keyword === "anyOf");
    const otherErrors = es.filter(
      e => !["required", "anyOf"].includes(e.keyword)
    );
    return [...otherErrors, ...requiredErrors, ...anyOfErrors];
  };

  const formatSchemaError = (e: E, i: number) => {
    const message =
      e.keyword === "required"
        ? `might require property '${e.params.missingProperty}'`
        : e.keyword === "anyOf"
        ? "does not match any of its schemas"
        : e.message;
    const suffix = e.keyword === "enum" ? e.params.allowedValues : "";
    return `${e.instancePath || "/"} in [${i}]: ${message}${
      suffix ? ` (${suffix})` : ""
    }`;
  };
</script>

<textarea
  name="add-batch"
  id="add-batch"
  cols="30"
  rows="10"
  bind:value={text}
  on:input={() => {
    try {
      const json = JSON.parse(text);
      if (json instanceof Array) {
        if (json.length) {
          const validities = json.map(obj => checkBatch(obj));
          const allValid = validities.every(v => v === true);
          if (allValid) {
            errors = [];
          } else {
            errors = validities
              .map((v, i) =>
                v === true
                  ? ""
                  : sortSchemaErrors(v).map(e => formatSchemaError(e, i))
              )
              .flat();
          }
        } else {
          errors = ["Empty"];
        }
      } else {
        errors = ["Expected an array"];
      }
    } catch (err) {
      errors = ["Invalid JSON"];
    }
  }}
/>
{#if errors.length}
  {#each errors as s}
    <code class="my-1">{s}</code>
  {/each}
{:else}
  <ProgressButton
    text="Add batch"
    valid={true}
    {a}
    {b}
    {refresh}
    write={() => addBatchedCommitments(db, JSON.parse(text), a, b)}
  />
{/if}
