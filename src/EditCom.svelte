<script lang="ts">
  import { writable } from "svelte/store";
  import {
    type Commitment,
    displayCom,
    requiredComDetails,
  } from "../functions/src/commitment";
  import type {  OxDate } from "../functions/src/date";
  import ComDetails from "./ComDetails.svelte";
  import { editCommitment, keyValuesToObj } from "./lib/db";
  import ProgressButton from "./lib/ProgressButton.svelte";
  import Time from "./lib/Time.svelte";
  import type { Firestore } from "firebase/firestore";
    import { localToUtcTime } from "../functions/src/time";

  export let db: Firestore;
  export let com: Commitment | undefined;
  export let index: number | undefined;
  export let date: OxDate | undefined;
  export let refresh: () => Promise<unknown>;

  let isEditing = false;
  $: title =
    com === undefined ? "No commitment selected" : displayCom(com).title;
  let time = writable<string | undefined>();
  let endTime = writable<string | null>();
  let details = writable<string[]>([]);
  $: {
    time.set(com?.time ?? "00:00");
    endTime.set(com === undefined ? null : com.endTime);
    details.set(Object.values(com?.details ?? []));
  }
  let progressA = writable(0);
  let progressB = writable(0);
</script>

<section class="group flex flex-col items-center sm:items-start">
  <h2 class="w-full">Edit commitment</h2>
  <div class="flex items-baseline">
    <p class="font-bold" class:italic={com !== undefined}>{title}</p>
    <button
      class="ml-6 button"
      class:invisible={com === undefined || isEditing}
      on:click={() => (isEditing = true)}>Edit</button
    >
  </div>
  {#if com !== undefined && isEditing}
    <Time idPrefix="edit-com" {time} {endTime} />
    <ComDetails comType={com.type} {details} />
    <ProgressButton
      text="Edit"
      valid={$time !== undefined &&
        requiredComDetails[com.type].length === $details.length &&
        $details.every(d => d.length)}
      a={progressA}
      b={progressB}
      {refresh}
      write={async () => {
        if (
          com === undefined ||
          date === undefined ||
          index === undefined ||
          $time === undefined
        ) {
          throw new Error("No date or index for commitment editing");
        }
        await editCommitment(
          db,
          date,
          index,
          {
            day: date.day,
            time: localToUtcTime($time),
            endTime: $endTime === null ? null : localToUtcTime($endTime),
            type: com.type,
            details: keyValuesToObj(requiredComDetails[com.type], $details),
          },
          progressA,
          progressB
        );
      }}
    />
  {/if}
</section>
