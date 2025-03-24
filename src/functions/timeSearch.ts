import { parseISO } from 'date-fns'

export function findClosestFrame(frames: string[], time: Date) {
  let close = index(frames, compare, time)
  if (close < 0) close = 0
  return close
}

function compare(value: Date, target: Date) {
  return value.valueOf() - target.valueOf()
}

function index(arr: string[], compare: (...args: [Date, Date]) => number, target: Date) {
  // binary search, with custom compare function
  let l = 0,
    r = arr.length - 1
  while (l <= r) {
    const m = l + ((r - l) >> 1)
    const comp = compare(parseISO(arr[m]), target)
    if (comp < 0)
      // arr[m] comes before the element
      l = m + 1
    else if (comp > 0)
      // arr[m] comes after the element
      r = m - 1
    // this[m] equals the element
    else return m
  }
  return l - 1 // return the index of the next left item
  // usually you would just return -1 in case nothing is found
}
