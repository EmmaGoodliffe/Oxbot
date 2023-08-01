<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import { comTypes, requiredComDetails } from "../functions/src/commitment";
  import type { OxDate } from "../functions/src/date";
  import ComDetails from "./ComDetails.svelte";
  import Date from "./lib/Date.svelte";
  import { addCommitment, keyValuesToObj } from "./lib/db";
  import ProgressButton from "./lib/ProgressButton.svelte";
  import Time from "./lib/Time.svelte";
  import type { Firestore } from "firebase/firestore";
  import { localToUtcTime } from "../functions/src/time";

  export let db: Firestore;
  export let date: Writable<OxDate>;
  export let refresh: () => Promise<unknown>;

  let isAdding = false;
  let time = writable<string | undefined>(undefined);
  let endTime = writable<string | null>(null);
  let comType = comTypes[0];
  let details = writable<string[]>([]);
  let progressA = writable(0);
  let progressB = writable(0);
</script>

<div class="flex flex-col">
  <Date idPrefix="add-com" {date} initialDate={$date} />
  <Time idPrefix="add-com" {time} {endTime} />
  <select class="" bind:value={comType} on:change={() => details.set([])}>
    {#each comTypes as ct}
      <option value={ct}>{ct}</option>
    {/each}
  </select>
  <ComDetails {comType} {details} />
  <ProgressButton
    text="Add"
    valid={time !== undefined &&
      requiredComDetails[comType].length === $details.length &&
      $details.every(d => d.length)}
    a={progressA}
    b={progressB}
    refresh={async () => {
      isAdding = false;
      await refresh();
    }}
    write={async () => {
      if ($time === undefined) {
        throw new Error("No time");
      }
      await addCommitment(
        db,
        $date,
        {
          day: $date.day,
          time: localToUtcTime($time),
          endTime: $endTime === null ? null : localToUtcTime($endTime),
          type: comType,
          details: keyValuesToObj(requiredComDetails[comType], $details),
        },
        progressA,
        progressB
      );
    }}
  />
</div>
