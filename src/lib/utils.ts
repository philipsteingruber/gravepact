export const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const pickRandom = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

export const shuffle = <T>(arr: T[]): T[] => {
  if (arr.length === 0) return arr;
  let currentIndex = arr.length;

  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
};
