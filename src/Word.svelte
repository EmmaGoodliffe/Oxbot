<script lang="ts">
  // import { getAnalytics } from "firebase/analytics";
  import { isErrorRes } from "../functions/src/types";
  import type { ApiRes, WikiWord } from "../functions/src/types";
  import type { HttpsCallableResult } from "firebase/functions";

  export let getWord: () => Promise<HttpsCallableResult<ApiRes<WikiWord>>>;

  const getWordProm = async () => {
    const { data } = await getWord();
    if (isErrorRes(data)) {
      throw new Error(`Error getting word: ${data.error}`);
    }
    const word = data.result;
    console.log(word);
    return word;
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

<div id="word">
  {#await wordProm then word}
    {#if word}
      <p>
        <a href={word.url} target="_blank" class="font-bold">{word.word}</a>
        <span class="italic">{word.classification}</span>
      </p>
      {@html linksToSpans(word.definition)}
    {/if}
  {/await}
</div>
