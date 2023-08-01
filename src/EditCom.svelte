<script lang="ts">
  import { writable } from "svelte/store";
  import {
    type Commitment,
    displayCom,
    requiredComDetails,
  } from "../functions/src/commitment";
  import { oxToGregDate, type OxDate } from "../functions/src/date";
  import ComDetails from "./ComDetails.svelte";
  import { editCommitment, keyValuesToObj } from "./lib/db";
  import ProgressButton from "./lib/ProgressButton.svelte";
  import Time from "./lib/Time.svelte";
  import type { Firestore } from "firebase/firestore";
  import { localToUtcTime } from "../functions/src/time";
  import Dialog from "./Dialog.svelte";

  export let db: Firestore;
  export let com: Commitment | undefined;
  export let index: number | undefined;
  export let date: OxDate | undefined;
  export let refresh: () => Promise<unknown>;

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

<div class="flex flex-col">
  {#if com === undefined}
    <p class="font-bold text-center">No commitment</p>
  {:else}
    <p class="font-bold italic text-center">{title}</p>
    {#if date !== undefined}
      <p class="text-center">{oxToGregDate(date)}</p>
    {/if}
    <Time idPrefix="edit-com" {time} {endTime} />
    <ComDetails comType={com.type} {details} />
    <ProgressButton
      text="Edit"
      valid={$time !== undefined &&
        requiredComDetails[com.type].length === $details.length &&
        $details.every(d => d.length)}
      a={progressA}
      b={progressB}
      refresh={async () => {
        await refresh();
      }}
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
</div>
