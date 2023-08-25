<script lang="ts">
  import { isErrorRes } from "../functions/src/types";
  import type { ApiRes, WikiWord } from "../functions/src/types";
  import type { HttpsCallableResult } from "firebase/functions";

  export let getWord: () => Promise<HttpsCallableResult<ApiRes<WikiWord>>>;

  let showDefinition = false;

  const getWordProm = async () => {
    const { data } = await getWord();
    if (isErrorRes(data)) {
      throw new Error(`Error getting word: ${data.error}`);
    }
    return data.result;
  };

  const wordProm = getWordProm();

  const linksToSpans = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const links = Array.from(doc.getElementsByTagName("a"));
    links.forEach(a => {
      const span = doc.createElement("span");
      span.innerHTML = a.innerHTML;
      a.insertAdjacentElement("afterend", span);
      a.remove();
    });
    return doc.body.innerHTML;
  };
</script>

<div class="max-h-[16rem] px-4 py-2 overflow-auto" id="word">
  {#await wordProm then word}
    {#if word}
      <div class="overflow-hidden" class:fade={!showDefinition}>
        <p>
          <a href={word.url} target="_blank" class="font-bold">{word.word}</a>
          <span class="italic">{word.classification}</span>
        </p>
        {@html linksToSpans(word.definition)}
      </div>
      {#if !showDefinition}
        <div class="group/ellipsis">
          <div class="ellipsis">
            <button on:click={() => (showDefinition = true)}>...</button>
          </div>
        </div>
      {/if}
    {/if}
  {/await}
</div>

<style lang="postcss">
  .fade {
    @apply h-36;
    mask-image: linear-gradient(rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
  }
  .ellipsis {
    @apply flex flex-1 justify-between items-center;
  }
  .ellipsis button {
    @apply mx-2 px-4 py-1 border-2 border-light-bg group-hover/ellipsis:border-light-ui rounded;
  }
  .ellipsis::before,
  .ellipsis::after {
    content: "";
    @apply flex-1 h-1 bg-light-bg group-hover/ellipsis:bg-light-ui transition;
  }
</style>
