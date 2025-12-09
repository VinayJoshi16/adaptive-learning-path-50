import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animate?: boolean;
  threshold?: number;
  showThreshold?: boolean;
}

export function ScoreGauge({ 
  score, 
  label, 
  size = 'md', 
  showPercentage = true,
  animate = true,
  threshold = 65,
  showThreshold = false
}: ScoreGaugeProps) {
  const sizeConfig = {
    sm: { dimension: 80, strokeWidth: 6, fontSize: 'text-lg', thresholdWidth: 2 },
    md: { dimension: 120, strokeWidth: 8, fontSize: 'text-2xl', thresholdWidth: 3 },
    lg: { dimension: 160, strokeWidth: 10, fontSize: 'text-4xl', thresholdWidth: 4 },
  };

  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Calculate threshold position on the circle
  const thresholdOffset = circumference - (threshold / 100) * circumference;

  const getColorClass = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 70) return 'hsl(var(--success))';
    if (score >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        <svg
          className="transform -rotate-90"
          width={config.dimension}
          height={config.dimension}
        >
          {/* Background circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
          />
          {/* Threshold indicator arc */}
          {showThreshold && (
            <circle
              cx={config.dimension / 2}
              cy={config.dimension / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--destructive) / 0.3)"
              strokeWidth={config.strokeWidth}
              strokeDasharray={`${circumference - thresholdOffset} ${thresholdOffset}`}
              strokeDashoffset={0}
            />
          )}
          {/* Progress circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor(score)}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(animate && "transition-all duration-700 ease-out")}
          />
          {/* Threshold marker line */}
          {showThreshold && (
            <circle
              cx={config.dimension / 2}
              cy={config.dimension / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth={config.strokeWidth + 2}
              strokeDasharray={`${config.thresholdWidth} ${circumference - config.thresholdWidth}`}
              strokeDashoffset={thresholdOffset}
              opacity={0.8}
            />
          )}
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-display font-bold", config.fontSize, getColorClass(score))}>
              {Math.round(score)}%
            </span>
            {showThreshold && (
              <span className="text-[10px] text-muted-foreground">min: {threshold}%</span>
            )}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}