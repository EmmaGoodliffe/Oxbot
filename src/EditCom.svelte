<script lang="ts">
  import { writable } from "svelte/store";
  import {
    type Commitment,
    displayCom,
    requiredComDetails,
  } from "../functions/src/commitment";
  import { type OxDate, oxToGregDate } from "../functions/src/date";
  import { localToUtcTime } from "../functions/src/time";
  import ComDetails from "./ComDetails.svelte";
  import BorderGroup from "./lib/BorderGroup.svelte";
  import { deleteCommitment, editCommitment, keyValuesToObj } from "./lib/db";
  import ProgressButton from "./lib/ProgressButton.svelte";
  import Time from "./lib/Time.svelte";
  import type { Firestore } from "firebase/firestore";

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
  let showDelete = false;
  let deleteProgressA = writable(0);
  let deleteProgressB = writable(0);
</script>

<div class="flex flex-col">
  {#if com === undefined}
    <p class="font-bold text-center">No commitment</p>
  {:else}
    <div class="mx-auto">
      <BorderGroup withRight={true}>
        <div class="w-max px-4 flex flex-col">
          <p class="font-bold italic">{title}</p>
          {#if date !== undefined}
            <p class="">{oxToGregDate(date)}</p>
          {/if}
        </div>
        <div slot="right" class="h-full flex">
          <button class="px-4" on:click={() => (showDelete = !showDelete)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="fill-text"
              ><path
                d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"
              /><path d="M9 10h2v8H9zm4 0h2v8h-2z" /></svg
            >
          </button>
        </div>
      </BorderGroup>
    </div>

    {#if showDelete}
      <ProgressButton
        text="Delete"
        valid={true}
        a={deleteProgressA}
        b={deleteProgressB}
        {refresh}
        write={async () => {
          if (date === undefined || index === undefined) {
            throw new Error("Not enough data for commitment deleting");
          }
          await deleteCommitment(
            db,
            date,
            index,
            deleteProgressA,
            deleteProgressB
          );
        }}
      />
    {/if}

    <Time
      idPrefix="edit-com"
      {time}
      {endTime}
      initialEndType={com.endTime === null ? "indefinite" : undefined}
    />
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
          throw new Error("Not enough data for commitment editing");
        }
        await editCommitment(
          db,
          date,
          index,
          {
            type: com.type,
            day: date.day,
            time: localToUtcTime($time),
            endTime: $endTime === null ? null : localToUtcTime($endTime),
            location: {},
            details: keyValuesToObj(requiredComDetails[com.type], $details),
          },
          progressA,
          progressB
        );
      }}
    />
  {/if}
</div>
