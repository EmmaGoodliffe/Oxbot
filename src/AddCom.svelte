<script lang="ts">
  import { writable } from "svelte/store";
  import { requiredComDetails } from "../functions/src/commitment";
  import { localToUtcTime } from "../functions/src/time";
  import { comTypes } from "../functions/src/types";
  import AddBatch from "./AddBatch.svelte";
  import ComDetails from "./ComDetails.svelte";
  import ComLocation from "./ComLocation.svelte";
  import Date from "./lib/Date.svelte";
  import { addCommitment, keyValuesToObj } from "./lib/db";
  import ProgressButton from "./lib/ProgressButton.svelte";
  import Time from "./lib/Time.svelte";
  import type { OxDate } from "../functions/src/date";
  import type { Commitment } from "../functions/src/types";
  import type { Firestore } from "firebase/firestore";
  import type { Writable } from "svelte/store";

  export let db: Firestore;
  export let date: Writable<OxDate>;
  export let refresh: () => Promise<unknown>;

  let time = writable<string | undefined>(undefined);
  let endTime = writable<string | null>(null);
  let comType = comTypes[0];
  let details = writable<string[]>([]);
  let location = writable<Commitment["location"]>({});
  let progressA = writable(0);
  let progressB = writable(0);
  let selectedAction: null | "batch" = null;
</script>

<div class="flex flex-col">
  <Date idPrefix="add-com" {date} initialDate={$date} />
  <Time idPrefix="add-com" {time} {endTime} />
  <select class="w-fit" bind:value={comType} on:change={() => details.set([])}>
    {#each comTypes as ct}
      <option value={ct}>{ct}</option>
    {/each}
  </select>
  <ComDetails {comType} {details} />
  <ComLocation {location} />
  <ProgressButton
    text="Add"
    valid={$time !== undefined &&
      requiredComDetails[comType].length === $details.length &&
      $details.every(d => d.length)}
    a={progressA}
    b={progressB}
    {refresh}
    write={async () => {
      if ($time === undefined) {
        throw new Error("No time");
      }
      await addCommitment(
        db,
        $date,
        {
          type: comType,
          day: $date.day,
          time: localToUtcTime($time),
          endTime: $endTime === null ? null : localToUtcTime($endTime),
          location: $location,
          details: keyValuesToObj(requiredComDetails[comType], $details),
        },
        progressA,
        progressB
      );
    }}
  />
  <p class="actions-header">More actions</p>
  <div>
    <button class="button action" on:click={() => (selectedAction = "batch")}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        class="fill-text"
        ><path
          d="M19 15v-3h-2v3h-3v2h3v3h2v-3h3v-2h-.937zM4 7h11v2H4zm0 4h11v2H4zm0 4h8v2H4z"
        /></svg
      >
      <span>Add batch</span>
    </button>
  </div>
  {#if selectedAction === "batch"}
    <AddBatch {db} {refresh} />
  {/if}
</div>
