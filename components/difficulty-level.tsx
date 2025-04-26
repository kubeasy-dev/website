import { DifficultyLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const DIFFICULTY_MAP: Record<DifficultyLevel, { color: string; height: string }> = {
  beginner: { color: "bg-green-500", height: "h-1" },
  intermediate: { color: "bg-yellow-500", height: "h-2" },
  advanced: { color: "bg-red-500", height: "h-3" },
};

export function DisplayDifficultyLevel({ level, showLabel }: Readonly<{ level: DifficultyLevel; showLabel?: boolean }>) {
  const difficulties = Object.keys(DIFFICULTY_MAP) as DifficultyLevel[];
  const levelIndex = difficulties.indexOf(level);

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-end gap-0.5'>
        {difficulties.map((key, idx) => {
          const { color: barColor, height } = DIFFICULTY_MAP[key];
          const isActive = idx <= levelIndex;
          return <div key={key} className={cn("w-1 transition-all duration-300 ease-in-out", height, isActive ? barColor : "bg-slate-300")} />;
        })}
      </div>
      {showLabel && <span className='text-xs text-gray-600 capitalize'>{level}</span>}
    </div>
  );
}
