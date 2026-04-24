export type VideoResolution = {
  name: string;
  height: number;
  width: number;
  videoBitrate: string;
};

const standarResolutions: VideoResolution[] = [
  { name: "1080p", height: 1080, width: 1920, videoBitrate: "4000k" },
  { name: "720p", height: 720, width: 1280, videoBitrate: "2500k" },
  { name: "480p", height: 480, width: 854, videoBitrate: "1000k" },
  { name: "360p", height: 360, width: 640, videoBitrate: "600k" },
];

export const getResolutionByRule = (OriginalHeight: number): VideoResolution[] => {
  const targetResolutions = standarResolutions.filter(
    (res) => res.height <= OriginalHeight,
  );
  if (targetResolutions.length === 0) {
    return [standarResolutions[standarResolutions.length - 1]];
  }
  return targetResolutions;
};
