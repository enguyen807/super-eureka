<script setup lang="ts">
// const { data } = await useFetch("/api/words/ee", {
//   headers: useRequestHeaders(["cookie"]),
// });

// console.log(data);

const data = ref(
  [
    {
        "eesti_name": "jooksma",
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
    {
        "eesti_name": "olema",
        "grammar": "verb"
    },
    {
        "eesti_name": "otsima",
        "grammar": "verb"
    }
]
)

const matrix = ref(Array(10).fill().map(()=>Array(10).fill()));

const setHorizontalWord = (row: number, start: number, end: number, word: string): void => {
  let i = 0;
  for (let index = start; index <= end; index++) {
      matrix.value[row][index] = word.charAt(i).toLocaleUpperCase();
      i++
  }
}

const setVerticalWord = (col: number, start: number, end: number, word: string): void => {
  let i = 0;
  for (let index = start; index <= end; index++) {
      console.log(index, col)
      matrix.value[index][col] = word.charAt(i).toUpperCase();
      i++
  }
}

const generateWordList = computed(() => {
  return data.value.map((word) => {
    const isVertical = Math.random() >= 0.5;
    const text = word.eesti_name;
    const alignment = Math.round(Math.random() * (9 - 0) + 0);
    const start = Math.round(Math.random() * ((9 - text.length) - 0) + 0);
    const end = start + text.length;

    return {
      text,
      start: isVertical ? [start, alignment] : [alignment, start],
      end: isVertical ? [end, alignment] : [alignment, end],
      isVertical
    }
  })
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
            {{cell || '-'}}
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
    font-size:22px;
    text-align:center;
    display: table-cell;
    vertical-align:middle;
}

</style>