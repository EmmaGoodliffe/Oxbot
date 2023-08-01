<script lang="ts">
  import {
    type Commitment,
    displayCom,
    type Week,
  } from "../functions/src/commitment";
  import { days, type OxDate } from "../functions/src/date";

  export let today: OxDate;
  export let weekProm: Promise<Week | undefined>;
  export let selectCom: (date: OxDate, index: number, com: Commitment) => void;
</script>

<section class="group">
  <h2>This week</h2>

  <div class="cards">
    {#each days as day}
      <div class="card min-h-[4rem]">
        <header class="px-2 py-1 font-bold italic">{day}</header>
        {#await weekProm}
          <div class="commitment">
            <div class="time w-20 pl-4 pr-2">00:00</div>
            <div class="description px-2">Loading...</div>
          </div>
        {:then week}
          {#each week?.commitments ?? [] as com, i}
            {#if day === com.day}
              <!-- TODO: hover for details -->
              <button
                class="commitment"
                on:click={() => selectCom({ ...today, day }, i, com)}
              >
                <div class="time w-20 pl-4 pr-2">{displayCom(com).time}</div>
                <div class="description px-2">{displayCom(com).title}</div>
              </button>
            {/if}
          {/each}
        {/await}
      </div>
    {/each}
  </div>
</section>
