export function findChangedProperties<T>(
  object1: T,
  object2: T
): {property: keyof T; previousValue: T[keyof T]; currentValue: T[keyof T]}[] {
  const changedProperties: {
    property: keyof T;
    previousValue: T[keyof T];
    currentValue: T[keyof T];
  }[] = [];

  for (const key in object1) {
    if (object1[key] !== object2[key]) {
      changedProperties.push({
        property: key as keyof T,
        previousValue: object1[key],
        currentValue: object2[key],
      });
    }
  }

  return changedProperties;
}

export function hasChanges<T extends object>(object1: T, object2: T): boolean {
  if (Object.keys(object1).length !== Object.keys(object2).length) {
    return true;
  }
  
  return findChangedProperties(object1, object2).length > 0;
}