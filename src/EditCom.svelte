<script lang="ts">
  import { writable } from "svelte/store";
  import {
    type Commitment,
    displayCom,
    requiredComDetails,
  } from "./lib/commitment";
  import ProgressButton from "./lib/ProgressButton.svelte";
  import Time from "./lib/Time.svelte";
  import { editCommitment, keyValuesToObj } from "./lib/db";
  import ComDetails from "./ComDetails.svelte";
  import type { OxDate } from "./lib/date";
  import type { Firestore } from "firebase/firestore";

  export let db: Firestore;
  export let com: Commitment | undefined;
  export let index: number | undefined;
  export let date: OxDate | undefined;
  export let refresh: () => Promise<unknown>;

  let isEditing = false;
  $: title =
    com === undefined ? "No commitment selected" : displayCom(com).title;
  let time = writable<number | undefined>();
  let endTime = writable<number | null>();
  let details = writable<string[]>([]);
  $: {
    time.set(com?.time ?? 0);
    endTime.set(com === undefined ? null : com.endTime);
    details.set(Object.values(com?.details ?? []));
  }
  let progressA = writable(0);
  let progressB = writable(0);
</script>

<section class="group">
  <h2>Edit commitment</h2>
  <div class="flex items-baseline">
    <p class="font-bold" class:italic={com === undefined}>{title}</p>
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
            time: $time,
            endTime: $endTime,
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
