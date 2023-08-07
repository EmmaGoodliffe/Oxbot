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
  let selectedAction: null | "delete" = null;
</script>

<div class="flex flex-col">
  {#if com === undefined}
    <p class="font-bold text-center">No commitment</p>
  {:else}
    <div class="mx-auto px-4 flex flex-col items-center">
      <p class="font-bold italic">{title}</p>
      {#if date !== undefined}
        <p class="">{oxToGregDate(date)}</p>
      {/if}
    </div>

    <!-- TODO: Use local times -->
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
    <p class="actions-header">More actions</p>
    <div class="">
      <button
        class="button action"
        on:click={() => (selectedAction = "delete")}
      >
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
        <span>Delete</span>
      </button>
    </div>
    {#if selectedAction}
      <div class="my-2 flex items-center">
        <p>
          {selectedAction === "delete"
            ? "Are you sure you want to delete this commitment?"
            : ""}
        </p>
        <button
          class="button icon ml-6 mr-4"
          on:click={async () => {
            const action = selectedAction;
            selectedAction = null;
            if (action === "delete") {
              if (date === undefined || index === undefined) {
                throw new Error("No date or index");
              }
              await deleteCommitment(db, date, index);
            }
            await refresh();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-text"
            ><path
              d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"
            /></svg
          >
        </button>
        <button class="button icon" on:click={() => (selectedAction = null)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            class="fill-text"
            ><path
              d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"
            /></svg
          >
        </button>
      </div>
    {/if}
  {/if}
</div>
