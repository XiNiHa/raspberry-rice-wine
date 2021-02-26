export function insertBetween<T> (arr: T[], value: T): T[] {
  const result: T[] = []

  for (let i = 0; i < arr.length; i++) {
    if (i !== 0) {
      result.push(value)
    }
    result.push(arr[i])
  }

  return result
}
