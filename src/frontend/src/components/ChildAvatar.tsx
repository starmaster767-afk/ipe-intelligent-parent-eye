interface ChildAvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ChildAvatar({
  name,
  color,
  size = "md",
  className = "",
}: ChildAvatarProps) {
  const initials = getInitials(name);
  const sizeClass = sizeMap[size];

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-display font-bold text-white shadow-md flex-shrink-0 ${className}`}
      style={{ background: color }}
      aria-label={`${name}'s avatar`}
    >
      {initials}
    </div>
  );
}
