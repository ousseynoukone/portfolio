export function  removeStringFromArray(stringArray : string [], stringToRemove : string) {
    // Filter the array to keep only elements that are not equal to the string to remove
    return stringArray.filter((string) => string !== stringToRemove);
  }


