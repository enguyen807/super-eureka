<script setup lang="ts">
// const { data } = await useFetch("/api/words/ee", {
//   headers: useRequestHeaders(["cookie"]),
// });

// console.log(data);

interface SetWord {
  (row: number, start: number, end: number, word: string): void
}

interface Word {
  eesti_name: string,
  grammar: string
}

interface WordList {
  text: string,
  start: number[],
  end: number[],
  isVertical: boolean
}

// const isVertical = ref<boolean>(false);
const data = ref<Word[]>(
  [
    {
      "eesti_name": "jooks",
      "grammar": "verb"
    },
    {
      "eesti_name": "tulema",
      "grammar": "verb"
    },
    {
      "eesti_name": "kasutama",
      "grammar": "verb"
    },

    // {
    //   "eesti_name": "xyz",
    //   "grammar": "verb"
    // }
    // {
    //     "eesti_name": "olema",
    //     "grammar": "verb"
    // },
    // {
    //     "eesti_name": "otsima",
    //     "grammar": "verb"
    // }
  ]
)

const matrix = ref(Array(15).fill('').map(() => Array(15).fill(`-`)));

const setHorizontalWord: SetWord = (row, start, end, word) => {
  let i = 0;
  for (let index = start; index < end; index++) {
    matrix.value[row][index] = word.charAt(i).toLocaleUpperCase();
    i++
  }
}

const setVerticalWord: SetWord = (col, start, end, word) => {
  let i = 0;
  for (let index = start; index < end; index++) {
    matrix.value[index][col] = word.charAt(i).toUpperCase();
    i++
  }
}

const handleWordPlacement = (wordList: WordList[], isVertical: boolean, text: string): { start: number, end: number, alignment: number } => {
  let start = Math.round(Math.random() * ((10 - text.length) - 0) + 0);
  let end = start + text.length;
  let alignment = Math.round(Math.random() * (7 - 2) + 2);

  if (!wordList.length) {
    //Math.round(Math.random() * (7 - 2) + 2)
    // hardcode 5 will handle what happens if word overflows grid 

    return {
      start,
      end,
      alignment
    }
  }
  const prev = wordList[wordList.length - 1];

  if (isVertical) {
    //check if char in current word exists in prev word
    const foundChars = text.split('').map(val => prev.text.indexOf(val)).filter(val => val >= 0);
    // console.log(foundChars);
    const randomIndex = Math.floor(Math.random() * foundChars.length);

    const similarLetter = prev.text.split('')[foundChars[randomIndex]]
    // console.log(similarLetter)


    start = prev.start[0] - text.indexOf(similarLetter);
    end = start + text.length;
    alignment = prev.start[1] + foundChars[randomIndex];
    // console.log(alignment)


    return {
      start,
      end,
      alignment
    }
  }

  // console.log(prev)
  const foundChars = text.split('').map(val => prev.text.indexOf(val)).filter(val => val >= 0);
  const randomIndex = Math.floor(Math.random() * foundChars.length);
  console.log(foundChars);
  const similarLetter = prev.text.split('')[foundChars[randomIndex]]
  console.log(similarLetter)

  start = prev.start[1] - text.indexOf(similarLetter);
  end = start + text.length;
  alignment = prev.start[0] + foundChars[randomIndex]

  return {
    start,
    end,
    alignment: alignment,
  }
}

const handleWrdPlacement = (
  words: string[], index = 0, result: { text: string, start: number[], end: number[], alignment: number, isVertical: boolean }[] = []): 
  { text: string, start: number[], end: number[], alignment: number, isVertical: boolean }[] => {
  if (index === words.length) {
    return result
  }

  // Set initial placement of first word
  if (!result.length) {
    const currentWord = words[index].toLowerCase();
    const start = Math.floor(Math.random() * ((10 - currentWord.length) - 0) + 0);
    const end = start + currentWord.length;
    const isVertical = false;
    const alignment = Math.floor(Math.random() * (7 - 2) + 2);

    result.push({
      text: currentWord,
      start: isVertical ? [start, alignment] : [alignment, start],
      end: isVertical ? [end, alignment] : [alignment, end],
      alignment,
      isVertical
    });

    return handleWrdPlacement(words, index + 1, result)
  }

  const currentWord = result.length ? result[index - 1].text : words[index].toLowerCase();
  const otherWords = words.slice(0, index).concat(words.slice(index + 1));
  console.log(otherWords)

  const hasMatchingLetter = otherWords.filter((otherWord) =>
    currentWord.split('').some((letter) => otherWord.toLowerCase().includes(letter))
  );

  if (hasMatchingLetter) {
    const matchedWord = hasMatchingLetter[hasMatchingLetter.length - 1];
    const prevWord = currentWord;
    
    //check if letter in current word exists in prev word
    const foundChars = matchedWord.split('').map(val => prevWord.indexOf(val)).filter(val => val >= 0);
    const randomIndex = Math.floor(Math.random() * foundChars.length);
    const similarLetter = prevWord.split('')[foundChars[randomIndex]];

    const isVertical = result[index - 1].isVertical ? false : true;
    const start = result[index - 1].start[isVertical ? 0 : 1] - matchedWord.indexOf(similarLetter);
    const end = start + matchedWord.length;
    const alignment = result[index - 1].start[isVertical ? 1 : 0] + foundChars[randomIndex];

    // console.log(start);
    result.push({
      text: matchedWord,
      start: isVertical ? [start, alignment] : [alignment, start],
      end: isVertical ? [end, alignment] : [alignment, end],
      alignment,
      isVertical
    });
  }

  return handleWrdPlacement(words, index + 1, result)

}

const checkForCompatibleWords = (words: string[], index = 0, result: string[] = []): string[] => {
  if (index === words.length) {
    return result;
  }

  const currentWord = words[index].toLowerCase();
  const otherWords = words.slice(0, index).concat(words.slice(index + 1));

  const hasMatchingLetter = otherWords.some((otherWord) =>
    currentWord.split('').some((letter) => otherWord.toLowerCase().includes(letter))
  );

  if (hasMatchingLetter) {
    result.push(words[index]);
  }

  return checkForCompatibleWords(words, index + 1, result);
}

const generateWordList = computed<WordList[]>(() => {
  // const wordList: WordList[] = [];

  return handleWrdPlacement(checkForCompatibleWords(data.value.map(word => word.eesti_name)));
  // console.log(test);
  
  // checkForCompatibleWords(data.value.map(word => word.eesti_name))
  //   .forEach((word, index) => {
  //     const { start, end, alignment } = handleWordPlacement(wordList, isVertical.value, word);

  //     wordList.push({
  //       text: word,
  //       start: isVertical.value ? [start, alignment] : [alignment, start],
  //       end: isVertical.value ? [end, alignment] : [alignment, end],
  //       isVertical: isVertical.value
  //     })
  //     // basically set every other word as vertical
  //     isVertical.value = !isVertical.value
  //   })
  // console.log(wordList);
  // return test;
})

onMounted(() => {
  generateWordList.value.forEach(word => {
    // not vertical therefore row
    if (!word.isVertical) {
      setHorizontalWord(word.start[0], word.start[1], word.end[1], word.text)
    } else {
      // column
      setVerticalWord(word.start[1], word.start[0], word.end[0], word.text)
    }
  });
})
</script>

<template>
  <table>
    <tbody>
      <tr v-for="(rows, rowIndex) in matrix" :id="`row_${rowIndex}`">
        <td v-for="(cell, cellIndex) in rows" :id="`r${rowIndex}_c${cellIndex}`" style="padding: 15px 20px;">
          {{ cell }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style>
.grid {
  width: 540px;
  height: 540px;
  margin: 20px;
  border: 25px solid #333;
}

.slot {
  float: left;
  width: 25px;
  height: 25px;
  background-color: #e9e9e9;
  border: 1px solid #e9e9e9;
  font-size: 22px;
  text-align: center;
  display: table-cell;
  vertical-align: middle;
}
</style>