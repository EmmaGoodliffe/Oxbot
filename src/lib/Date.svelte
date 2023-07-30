<script lang="ts">
  import {
    days,
    gregToOxDate,
    type OxDate,
    oxDate,
    oxToGregDate,
    terms,
  } from "../../functions/src/date";
  import type { Writable } from "svelte/store";

  export let idPrefix: string;
  export let date: Writable<OxDate>;
  export let initialDate: OxDate;

  let gregDate = oxToGregDate(initialDate);
  let { term, day } = initialDate;
  let year = initialDate.year.toString();
  let week = initialDate.week.toString();
  let useOxDate = false;

  $: {
    date.update(
      d =>
        (useOxDate ? oxDate(year, term, week, day) : gregToOxDate(gregDate)) ??
        d
    );
    year = $date.year.toString();
    term = $date.term;
    week = $date.week.toString();
    day = $date.day;
    gregDate = oxToGregDate($date);
  }
</script>

<div class=" flex flex-col md:flex-row sm:items-center max-w-[12rem] sm:max-w-none">
  <input
    type="date"
    class="min-w-[10rem] bg-bg either-date"
    class:selected={!useOxDate}
    bind:value={gregDate}
    on:focus={() => (useOxDate = false)}
  />
  <div class="px-6 py-4 text-center italic">or</div>
  <div
    class="flex flex-col sm:flex-row sm:items-center either-date"
    class:selected={useOxDate}
  >
    <div class="ox-date-input">
      <label for="{idPrefix}-year" class="px-4">year</label>
      <input
        type="text"
        class="w-16"
        id="{idPrefix}-year"
        bind:value={year}
        on:focus={() => (useOxDate = true)}
      />
    </div>
    <div class="ox-date-input">
      <label for="{idPrefix}-term" class="px-4">term</label>
      <select
        class="my-2 px-2 py-2 bg-light-bg rounded"
        id="{idPrefix}-term"
        bind:value={term}
        on:focus={() => (useOxDate = true)}
      >
        {#each terms as term}
          <option value={term}>{term}</option>
        {/each}
      </select>
    </div>
    <div class="ox-date-input">
      <label for="{idPrefix}-week" class="px-4">week</label>
      <input
        type="text"
        class="w-10"
        id="{idPrefix}-week"
        bind:value={week}
        on:focus={() => (useOxDate = true)}
      />
    </div>
    <div class="ox-date-input">
      <label for="{idPrefix}-day" class="px-4">day</label>
      <select
        class="my-2 px-2 py-2 bg-light-bg rounded"
        id="{idPrefix}-day"
        bind:value={day}
        on:focus={() => (useOxDate = true)}
      >
        {#each days as day}
          <option value={day}>{day}</option>
        {/each}
      </select>
    </div>
  </div>
</div>

<style lang="postcss">
  input {
    @apply text-center;
  }

  select {
    border-right: 0.5rem solid transparent;
  }

  .either-date {
    @apply min-h-[3.5rem] pr-4 border-2 border-dark-border rounded;
  }

  .either-date.selected {
    @apply border-light-border;
  }

  .ox-date-input {
    @apply my-2 flex justify-between items-center;
  }
</style>
