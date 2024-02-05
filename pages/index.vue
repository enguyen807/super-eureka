<script setup lang="ts">
// const { data } = await useFetch("/api/words/ee", {
//   headers: useRequestHeaders(["cookie"]),
// });


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

interface Result {
  text: string, 
  start: number[], 
  end: number[], 
  alignment: number, 
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
      "eesti_name": "kasutama",
      "grammar": "verb"
    },
    {
      "eesti_name": "tulema",
      "grammar": "verb"
    },
    // {
    //   "eesti_name": "xyz",
    //   "grammar": "verb"
    // }
    {
        "eesti_name": "olema",
        "grammar": "verb"
    },
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

const handleWordPlacement = (wordList: string[]): Result[] => {
  let result: Result[] = [];
  let i = wordList.length;
  let prevWord: Result | null = null;

  while (i--) {
    // console.log(i)
    // set initial position of first word
    if (!result.length) {
      const currentWord = wordList[i].toLowerCase();
      const start = Math.floor(Math.random() * ((10 - currentWord.length) - 0) + 0);
      const end = start + currentWord.length;
      const isVertical = false;
      const alignment = Math.floor(Math.random() * (7 - 2) + 2);

      const word: Result = {
        text: currentWord,
        start: isVertical ? [start, alignment] : [alignment, start],
        end: isVertical ? [end, alignment] : [alignment, end],
        alignment,
        isVertical
      }

      result.push(word);
      prevWord = word;

      wordList.splice(i, 1)
      continue;
    }

    const currentWord = wordList[i].toLowerCase();

    const otherWords = result.map(val => val.text);

    const getWordWithMatchingLetter = otherWords.filter((otherWord) =>
      currentWord.split('').some((letter) => otherWord.toLowerCase().includes(letter))
    );

    const matchedWord = getWordWithMatchingLetter.at(-1);
    if (!matchedWord) {
      console.log('no matching word')
      continue;
    }

    //check if letter in current word exists in prev word
    const foundChars = currentWord.split('').map(val => matchedWord.indexOf(val)).filter(val => val >= 0);
    const randomIndex = Math.floor(Math.random() * foundChars.length);
    const similarLetter = prevWord!.text.split('')[foundChars[randomIndex]];

    const isVertical = prevWord!.isVertical ? false : true;
    const start = (prevWord!.start[isVertical ? 0 : 1] - currentWord.indexOf(similarLetter));
    const end = start + currentWord.length;

    if (start < 0 || start > 14 || end < 0 || end > 14) {
      // end loop
      break;
    }

    const alignment = prevWord!.start[isVertical ? 1 : 0] + foundChars[randomIndex];

    const word: Result = {
      text: currentWord,
      start: isVertical ? [start, alignment] : [alignment, start],
      end: isVertical ? [end, alignment] : [alignment, end],
      alignment,
      isVertical
    }

    result.push(word);
    prevWord = word;
    wordList.splice(i, 1);
  }
  // console.log(result);

  return result;
}

const checkForValidGrid = (wordList: string[], grid: Result[] = []): Result[] => {
  if (grid.length === wordList.length) {
    return grid
  }

  return checkForValidGrid(wordList, handleWordPlacement(wordList));
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

const setup = () => {
  const words = data.value.map(word => word.eesti_name).sort((a, b) => b.length - a.length);
  console.log(words);
  return checkForValidGrid(
    checkForCompatibleWords(words), 
    handleWordPlacement(checkForCompatibleWords(words))
  );
}

const generateWordList = computed<WordList[]>(() => setup())

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