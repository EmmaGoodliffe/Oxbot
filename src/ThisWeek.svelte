<script lang="ts">
  import {
    type Commitment,
    displayCom,
    type Week,
  } from "../functions/src/commitment";
  import { days, type OxDate } from "../functions/src/date";

  export let today: OxDate;
  export let weekProm: Promise<Week | undefined>;
  export let addCom: (date: OxDate) => void;
  export let selectCom: (date: OxDate, index: number, com: Commitment) => void;
</script>

<section class="group/section">
  <h2>This week</h2>

  <div class="cards">
    {#each days as day}
      <div class="card min-h-[4rem] group/day">
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
            <div class="time w-20 pl-4 pr-2">00:00</div>
            <div class="description px-2">Loading...</div>
          </div>
        {:then week}
          {#each week?.commitments ?? [] as com, i}
            {#if day === com.day}
              <!-- TODO: hover for details -->
              <div class="commitment group/com">
                <div class="time w-20 pl-4 pr-2">{displayCom(com).time}</div>
                <div
                  class="description w-full px-2 flex justify-between items-center"
                >
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
