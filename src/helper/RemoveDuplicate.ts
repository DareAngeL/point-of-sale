export function removeDuplicates(array: any[], propertyName: string) {
  const countMap = new Map();

  array.forEach((item) => {
    const propertyValue = item[propertyName];
    countMap.set(propertyValue, (countMap.get(propertyValue) || 0) + 1);
  });

  const result = array.filter((item) => countMap.get(item[propertyName]) === 1);

  return result;
}
