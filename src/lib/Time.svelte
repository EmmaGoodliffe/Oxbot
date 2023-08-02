<script lang="ts">
  import {
    addTimes,
    displayDuration,
    getDurationAsTime,
  } from "../../functions/src/time";
  import BorderGroup from "./BorderGroup.svelte";
  import type { Writable } from "svelte/store";

  export let idPrefix: string;
  export let time: Writable<string | undefined>;
  export let endTime: Writable<string | null>;
  export let initialEndType: (typeof endTypes)[number] = "time";

  const endTypes = ["time", "duration", "indefinite"] as const;
  let endType: typeof initialEndType = initialEndType;
  let endValue = $endTime === null ? "" : $endTime;
  let validTime = true;

  $: {
    validTime = false;
    if (endType === "time" && endValue.length === 5) {
      endTime.set(endValue);
      try {
        getDurationAsTime($time, $endTime);
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

<BorderGroup withRight={true}>
  <div class="my-2">
    <label class="w-12 inline-block text-right" for="{idPrefix}-start-time"
      >start</label
    >
    <input
      type="time"
      id="{idPrefix}-start-time"
      value={$time}
      on:input={e => time.set(e.currentTarget.value)}
    />
  </div>
  <div class="w-max my-2">
    <label class="w-12 inline-block text-right" for="{idPrefix}-end-time"
      >end</label
    >
    <div class="inline-flex flex-col sm:flex-row sm:items-baseline">
      <select
        class="mr-2"
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
              endValue = getDurationAsTime($time, $endTime);
            } catch (err) {
              validTime = false;
            }
          } else if (oldType === "duration" && newType === "time") {
            endValue = $endTime ?? "";
          }
        }}
      >
        {#each endTypes as et}
          <option value={et}>{et}</option>
        {/each}
      </select>
      <input
        type="time"
        class="h-min mt-2 sm:mt-0"
        id="{idPrefix}-end-time"
        disabled={endType === "indefinite"}
        bind:value={endValue}
      />
    </div>
  </div>
  <div
    slot="right"
    class="min-w-[8rem] h-full flex flex-col justify-center items-center"
  >
    <span>
      <span class:invisible={$time === undefined}
        >{$time === undefined ? "00:00" : $time}</span
      >-<span class:invisible={$endTime === null}
        >{typeof $endTime === "string" ? $endTime : "00:00"}</span
      >
    </span>
    <span
      class="italic"
      class:text-invalid={!validTime}
      class:invisible={validTime && displayedDuration.length === 1}
      >{validTime ? displayedDuration : "Invalid time"}</span
    >
  </div>
</BorderGroup>

<style lang="postcss">
  label {
    @apply pr-4;
  }
</style>
