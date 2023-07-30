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

<section class="group">
  <h2>Today</h2>
  {#await weekProm}
    <div
      class="flex flex-col border-2 border-border rounded-lg overflow-auto"
    >
      <div class="commitment">
        <div class="time w-[6rem]">00:00</div>
        <div class="description">
          <p class="font-bold">Loading...</p>
        </div>
      </div>
    </div>
  {:then week}
    {#if week?.commitments !== undefined && week.commitments.length > 0}
      <div
        class="flex flex-col border-2 border-border rounded-lg overflow-auto"
      >
        {#each sortCommitmentsByTime(week.commitments).map(displayCom) as com}
          {#if today.day === com.day}
            <div class="commitment">
              <div class="time w-[6rem] py-2">
                <span class="text-lg">{com.time}</span>
                {#if com.endTime !== null}
                  <span class="text-dark-text text-sm">{com.endTime}</span>
                {/if}
              </div>
              <div class="description">
                <p class="font-bold">{com.title}</p>
                {#if com.description !== undefined}
                  <p>{com.description}</p>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  {/await}
</section>
