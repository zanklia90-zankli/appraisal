
export const getScoreLegend = (score: number): string => {
  if (score >= 0 && score <= 2) return 'Poor';
  if (score >= 3 && score <= 4) return 'Fair';
  if (score >= 5 && score <= 7) return 'Good';
  if (score >= 8 && score <= 10) return 'Very Good';
  return 'N/A';
};

export const calculateScores = (scores: { [key: string]: number }): { average: number, percentage: number } => {
    const scoreValues = Object.values(scores);
    const numQuestions = scoreValues.length;

    if (numQuestions === 0) {
        return { average: 0, percentage: 0 };
    }

    const totalScore = scoreValues.reduce((acc, score) => acc + score, 0);
    const maxTotalScore = numQuestions * 10; // Each question is out of 10

    const percentage = (totalScore / maxTotalScore) * 100;
    const average = totalScore / numQuestions;

    return {
        average: parseFloat(average.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(2)),
    };
};

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URL');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};