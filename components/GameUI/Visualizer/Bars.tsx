type BarsProps = {
  dataArray: number[];
};

export default function Bars({ dataArray }: BarsProps) {
  const bars = dataArray.map((value) => {
    // Normalize value between 1 and 200
    const normalizedValue = 1 + (value / 255) * 199;
    return normalizedValue;
  });

  const numBars = bars.length;
  const padding = 20;
  const viewBoxWidth = 1000;
  const viewBoxHeight = 300;
  const spacing = 4;
  const barWidth = 8;
  const availableWidth = viewBoxWidth - (padding * 2);
  const totalBarsWidth = (barWidth * numBars) + (spacing * (numBars - 1));
  const startX = padding + (availableWidth - totalBarsWidth) / 2;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="w-full h-full stroke-current transition dark:bg-black dark:stroke-white"
      preserveAspectRatio="xMidYMid meet"
    >
      {bars.map((height, i) => {
        const xPosition = startX + (i * (barWidth + spacing));
        const barHeight = Math.max(1, height * 0.5);
        const yPosition = viewBoxHeight - barHeight;

        return (
          <rect
            key={i}
            x={xPosition}
            y={yPosition}
            width={barWidth}
            height={barHeight}
            fill="#1f1e33"
          />
        );
      })}
    </svg>
  );
}