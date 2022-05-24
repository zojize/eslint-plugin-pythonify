function bubbleSort(arr) {
  const n = arr.length;
  let i = 0;
  let j = 0;
  while (i < n) {
    while (j < n - 1 - i) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j + 1];
        arr[j + 1] = arr[j];
        arr[j] = temp;
      }
      j += 1;
    }
    i += 1;
  }
  return arr;
}
