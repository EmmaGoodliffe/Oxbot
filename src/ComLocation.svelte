<script lang="ts">
  import { areas, areaToCommute } from "../functions/src/commitment";
  import { toInt } from "../functions/src/date";
  import BorderGroup from "./lib/BorderGroup.svelte";
  import type { Commitment } from "../functions/src/types";
  import type { Writable } from "svelte/store";

  export let location: Writable<Commitment["location"]>;

  let area: Commitment["location"]["area"] | "" = "";
  let room = "";
  let commute: number | undefined = undefined;
  let commuteEnabled = false;

  $: {
    location.set({
      area: area || undefined,
      room: room.length ? room : undefined,
      commute: commuteEnabled ? commute : undefined,
    });
  }
</script>

<BorderGroup>
  <div class="location-detail">
    <label for="area" class:line-through={!area}>area</label>
    <select
      name="area"
      id="area"
      bind:value={area}
      on:input={e => {
        if (!commuteEnabled) {
          commute = areaToCommute(e.currentTarget.value);
        }
      }}
    >
      <option value="">/</option>
      {#each areas as a}
        <option value={a}>{a}</option>
      {/each}
    </select>
  </div>
  <div class="location-detail">
    <label for="room" class:line-through={!room}>room</label>
    <input type="text" id="room" bind:value={room} />
  </div>
  <div class="location-detail">
    <label for="commute" class:line-through={!commuteEnabled}>commute</label>
    <input
      type="number"
      class:text-dark-text={!commuteEnabled}
      id="commute"
      on:input={e => {
        const value = toInt(e.currentTarget.value);
        if (isNaN(value)) {
          commute = areaToCommute(area);
          commuteEnabled = false;
        } else {
          commute = value;
          commuteEnabled = true;
        }
      }}
      value={commute}
    />
  </div>
</BorderGroup>

<style lang="postcss">
  .location-detail {
    @apply my-2 flex justify-end items-center;
  }

  label {
    @apply pr-4 inline-block text-right;
  }

  input,
  select {
    @apply w-48;
  }
</style>
