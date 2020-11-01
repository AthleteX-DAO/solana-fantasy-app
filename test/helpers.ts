import { ok } from 'assert';

export const throwsAsync = async (block: () => Promise<any>, message?: string | Error) => {
  let error: any;
  try {
    await block();
  } catch (e) {
    error = e;
  }
  ok(error, message);
};

export function hasDuplicates(array: string | any[]) {
  var valuesSoFar = Object.create(null);
  for (var i = 0; i < array.length; ++i) {
    var value = array[i];
    if (value in valuesSoFar) {
      return true;
    }
    valuesSoFar[value] = true;
  }
  return false;
}
