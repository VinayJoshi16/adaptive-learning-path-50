import { Module } from '@/lib/content-data';
import { cn } from '@/lib/utils';
import { Clock, GraduationCap, CheckCircle } from 'lucide-react';
import { Button } from './button';

interface ModuleCardProps {
  module: Module;
  onSelect: (moduleId: string) => void;
  selected?: boolean;
  completed?: boolean;
  bestScore?: number;
}

export function ModuleCard({ module, onSelect, selected, completed, bestScore }: ModuleCardProps) {
  const levelConfig = {
    beginner: { 
      label: 'Beginner', 
      bgClass: 'bg-success/10',
      textClass: 'text-success',
      borderClass: 'border-success/30',
    },
    intermediate: { 
      label: 'Intermediate', 
      bgClass: 'bg-warning/10',
      textClass: 'text-warning',
      borderClass: 'border-warning/30',
    },
    advanced: { 
      label: 'Advanced', 
      bgClass: 'bg-destructive/10',
      textClass: 'text-destructive',
      borderClass: 'border-destructive/30',
    },
  };

  const config = levelConfig[module.level];

  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl border p-6 transition-all duration-300 hover:shadow-elevated cursor-pointer",
        selected 
          ? "border-primary shadow-glow ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50",
        completed && "ring-1 ring-success/30"
      )}
      onClick={() => onSelect(module.id)}
    >
      {/* Completed Badge */}
      {completed && (
        <div className="absolute top-4 left-4">
          <CheckCircle className="w-5 h-5 text-success" />
        </div>
      )}

      {/* Level Badge */}
      <div className={cn(
        "absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border",
        config.bgClass,
        config.textClass,
        config.borderClass
      )}>
        {config.label}
      </div>

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
        <GraduationCap className="w-6 h-6 text-primary-foreground" />
      </div>

      {/* Content */}
      <h3 className="font-display font-semibold text-lg text-foreground mb-2 pr-20">
        {module.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {module.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{module.duration} min</span>
        </div>
        <div className="flex items-center gap-2">
          {bestScore !== undefined && (
            <span className="text-xs text-muted-foreground">Best: {bestScore}%</span>
          )}
          <Button 
            variant={selected ? "default" : "outline"} 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(module.id);
            }}
          >
            {selected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  );
}
