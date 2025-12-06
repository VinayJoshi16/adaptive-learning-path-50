import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animate?: boolean;
}

export function ScoreGauge({ 
  score, 
  label, 
  size = 'md', 
  showPercentage = true,
  animate = true 
}: ScoreGaugeProps) {
  const sizeConfig = {
    sm: { dimension: 80, strokeWidth: 6, fontSize: 'text-lg' },
    md: { dimension: 120, strokeWidth: 8, fontSize: 'text-2xl' },
    lg: { dimension: 160, strokeWidth: 10, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

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
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("font-display font-bold", config.fontSize, getColorClass(score))}>
              {Math.round(score)}%
            </span>
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
