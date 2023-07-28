<script lang="ts">
  import {
    addTimes,
    displayDuration,
    getDurationAsTimeInput,
    intToTimeInput,
    timeInputToInt,
  } from "../../functions/src/date";
  import type { Writable } from "svelte/store";

  export let idPrefix: string;
  export let time: Writable<number | undefined>;
  export let endTime: Writable<number | null>;

  const endTypes = ["time", "duration", "indefinite"] as const;
  let endType: (typeof endTypes)[number] = "time";
  let endValue = $endTime === null ? "" : intToTimeInput($endTime);
  let validTime = true;

  $: {
    validTime = false;
    if (endType === "time" && endValue.length === 5) {
      endTime.set(timeInputToInt(endValue));
      try {
        getDurationAsTimeInput($time, $endTime);
        validTime = true;
      } catch (err) {
        console.log("Duration failed");
      }
    } else if (endType === "duration" && endValue.length === 5) {
      const addedTimes =
        $time === undefined ? undefined : addTimes($time, endValue);
      if (addedTimes !== null) {
        endTime.set(addedTimes ?? null);
        validTime = true;
      }
    } else if (endType === "indefinite") {
      endTime.set(null);
      validTime = true;
    }
  }

  $: displayedDuration = displayDuration($time, $endTime);
</script>

<div class="w-fit mt-8 flex border-2 border-slate-400 rounded">
  <div class="flex-1 px-4 py-4 border-r-2 border-slate-400">
    <div>
      <label for="{idPrefix}-start-time">start</label>
      <input
        type="time"
        id="{idPrefix}-start-time"
        value={$time === undefined ? undefined : intToTimeInput($time)}
        on:input={e => time.set(timeInputToInt(e.currentTarget.value))}
      />
    </div>
    <div class="w-max">
      <label for="{idPrefix}-end-time">end</label>
      <select
        class="mr-4"
        bind:value={endType}
        on:input={e => {
          const oldType = endType;
          const newType = e.currentTarget.value;
          if (
            endValue.length !== 5 ||
            oldType === "indefinite" ||
            newType === "indefinite"
          ) {
            endValue = "";
          } else if (oldType === "time" && newType === "duration") {
            try {
              endValue = getDurationAsTimeInput($time, $endTime);
            } catch (err) {
              validTime = false;
            }
          } else if (oldType === "duration" && newType === "time") {
            endValue = $endTime === null ? "" : intToTimeInput($endTime);
          }
        }}
      >
        {#each endTypes as et}
          <option value={et}>{et}</option>
        {/each}
      </select>
      <input
        type="time"
        id="{idPrefix}-end-time"
        disabled={endType === "indefinite"}
        bind:value={endValue}
      />
    </div>
  </div>
  <div class="flex-1 px-6 flex flex-col justify-center items-center">
    <span>
      <span class:invisible={$time === undefined}
        >{$time === undefined ? "00:00" : intToTimeInput($time)}</span
      >-<span class:invisible={$endTime === null}
        >{typeof $endTime === "number"
          ? intToTimeInput($endTime)
          : "00:00"}</span
      >
    </span>
    <span
      class="italic"
      class:text-red-500={!validTime}
      class:invisible={validTime && displayedDuration.length === 1}
      >{validTime ? displayedDuration : "Invalid time"}</span
    >
  </div>
</div>

<style lang="postcss">
  label {
    @apply pr-4;
  }
</style>
