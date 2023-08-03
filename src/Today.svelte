<script lang="ts">
  import {
    displayCom,
    sortCommitmentsByTime,
    type Week,
  } from "../functions/src/commitment";
  import type { OxDate } from "../functions/src/date";

  export let today: OxDate;
  export let weekProm: Promise<Week | undefined>;
</script>

<section class="group/section">
  <h2>Today</h2>
  {#await weekProm}
    <div class="flex flex-col border-2 border-border rounded-lg overflow-auto">
      <div class="commitment">
        <div class="time">
          <span class="text-lg">00:00</span>
        </div>
        <div class="description">
          <p class="font-bold">Loading...</p>
        </div>
      </div>
    </div>
  {:then week}
    {#if week?.commitments !== undefined && week.commitments.filter(com => com.day === today.day).length > 0}
      <div
        class="flex flex-col border-2 border-border rounded-lg overflow-auto"
      >
        {#each sortCommitmentsByTime(week.commitments.filter(com => com.day === today.day)).map(displayCom) as com}
          <div class="commitment">
            <div class="time">
              <span class="text-lg">{com.localTime}</span>
              {#if com.localEndTime !== null}
                <span class="text-dark-text text-sm">{com.localEndTime}</span>
              {/if}
            </div>
            <div class="description">
              <p class="font-bold">{com.title}</p>
              {#if com.description !== undefined}
                <p>{com.description}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="font-bold">Nothing on today</p>
    {/if}
  {/await}
</section>

<style lang="postcss">
  .time {
    @apply w-[6rem];
  }

  .description {
    @apply px-2 flex items-center;
  }
</style>
