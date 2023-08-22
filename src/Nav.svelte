<script lang="ts">
  import { isAwake as dbIsAwake } from "../functions/src/time";
  import type { OxDate } from "../functions/src/date";
  import type { Week } from "../functions/src/types";
  import type { Firestore } from "firebase/firestore";
  import type { NotificationPayload } from "firebase/messaging";

  export let db: Firestore;
  export let today: OxDate;
  export let thisWeekProm: Promise<Week | undefined>;
  export let wake: (db: Firestore, date: OxDate) => Promise<void>;
  export let toast: (not: NotificationPayload) => void;

  let isAwake = true;

  thisWeekProm.then(week => {
    const { isPastLonNoon, wasActiveToday } = dbIsAwake(week);
    isAwake = !!(isPastLonNoon || wasActiveToday);
  });
</script>

<nav class="my-2 flex justify-end">
  <div class="px-2 py-2 border-2 border-border rounded">
    <button
      class="button action"
      disabled={isAwake}
      on:click={async () => {
        await wake(db, today);
        toast({ title: "Woke" });
        isAwake = true;
      }}
    >
      {#if isAwake}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-dark-text"
          ><path
            d="M6.995 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007-2.246-5.007-5.007-5.007S6.995 9.239 6.995 12zM11 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2H2zm17 0h3v2h-3zM5.637 19.778l-1.414-1.414 2.121-2.121 1.414 1.414zM16.242 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.344 7.759 4.223 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z"
          /></svg
        >
        <span>Awake</span>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          class="fill-text"
          ><path
            d="M12 11.807A9.002 9.002 0 0 1 10.049 2a9.942 9.942 0 0 0-5.12 2.735c-3.905 3.905-3.905 10.237 0 14.142 3.906 3.906 10.237 3.905 14.143 0a9.946 9.946 0 0 0 2.735-5.119A9.003 9.003 0 0 1 12 11.807z"
          /></svg
        >
        <span>Wake</span>
      {/if}
    </button>

    <slot />
  </div>
</nav>

<style lang="postcss">
  nav button {
    @apply mr-2;
  }
</style>
