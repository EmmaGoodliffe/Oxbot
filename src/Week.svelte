<script lang="ts">
  import { writable, type Writable } from "svelte/store";
  import {
    type Commitment,
    displayCom,
    type Week,
  } from "../functions/src/commitment";
  import {
    days,
    getWeekId,
    oxToGregDate,
    type OxDate,
  } from "../functions/src/date";
  import Date from "./lib/Date.svelte";

  export let today: OxDate;
  export let week: Writable<OxDate>; // Only updated when `date` is confirmed
  export let weekProm: Promise<Week | undefined>;
  export let addCom: (date: OxDate) => void;
  export let selectCom: (date: OxDate, index: number, com: Commitment) => void;

  const date = writable(today);
  let isSelectingWeek = false;
</script>

<section class="group/section">
  <h2>Week</h2>

  <div class="mb-2">
    {#if isSelectingWeek}
      <Date {date} idPrefix="week" initialDate={$date} weekOnly>
        <div class="my-6 px-6 flex justify-center">
          <button
            class="button"
            on:click={() => {
              week.set($date);
              isSelectingWeek = false;
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="fill-text"
              ><path
                d="M19 4h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm.002 16H5V8h14l.002 12z"
              /><path
                d="m11 17.414 5.707-5.707-1.414-1.414L11 14.586l-2.293-2.293-1.414 1.414z"
              /></svg
            >
          </button>
        </div>
      </Date>
    {:else}
      <div class="flex flex-col items-center">
        <div class="w-full max-w-xs mb-2 flex justify-between">
          <button
            class="button"
            on:click={() => {
              date.update(d => ({
                ...d,
                week: d.week - 1,
              }));
              week.set($date);
            }}
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="fill-text"
              ><path
                d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"
              /></svg
            ></button
          >
          <button class="button" on:click={() => (isSelectingWeek = true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="fill-text"
              ><path
                d="M3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7v2H5a2 2 0 0 0-2 2zm16 14H5V8h14z"
              /></svg
            >
          </button>
          <button class="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              class="fill-text"
              ><path
                d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"
              /></svg
            >
          </button>
        </div>
        <p>{getWeekId($week)}</p>
      </div>
    {/if}
  </div>

  <div class="cards">
    {#each days as day}
      <div
        class="card min-h-[4rem] group/day"
        class:highlight={getWeekId($week) === getWeekId(today) &&
          day === today.day}
      >
        <header class="px-2 py-1 flex justify-between font-bold italic">
          <span>
            {day}
          </span>
          <button
            class="mx-1 hidden group-hover/day:block"
            on:click={() => {
              addCom({ ...today, day });
            }}>+</button
          >
        </header>
        {#await weekProm}
          <div class="commitment">
            <div class="time">00:00</div>
            <div class="description">Loading...</div>
          </div>
        {:then week}
          {#each week?.commitments ?? [] as com, i}
            {#if day === com.day}
              <!-- TODO: hover for details -->
              <div class="commitment group/com">
                <div class="time">
                  {displayCom(com).localTime}
                </div>
                <div class="description">
                  <span>
                    {displayCom(com).title}
                  </span>
                  <button
                    class="px-1 invisible group-hover/com:visible"
                    on:click={() => selectCom({ ...today, day }, i, com)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      class="fill-text"
                      ><path
                        d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z"
                      /><path
                        d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z"
                      /></svg
                    >
                  </button>
                </div>
              </div>
            {/if}
          {/each}
        {/await}
      </div>
    {/each}
  </div>
</section>

<style lang="postcss">
  .time {
    @apply w-20 pl-4 pr-2;
  }

  .description {
    @apply w-full px-2 flex justify-between items-center;
  }

  .highlight::after {
    @apply bg-light-border;
  }
</style>
