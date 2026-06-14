const SIZE_CLASSES = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-18 h-18",
} as const;

const TEXT_SIZES = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-xl",
} as const;

type AvatarSize = keyof typeof SIZE_CLASSES;

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  size?: AvatarSize;
  className?: string;
}

const GRADIENTS = [
  "from-indigo-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-indigo-500",
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function getGradient(seed?: string | null): string {
  if (!seed) return GRADIENTS[0];
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default function ProfileAvatar({
  avatarUrl,
  name,
  email,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const textSize = TEXT_SIZES[size];
  const initials = getInitials(name, email);
  const gradient = getGradient(email ?? name);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? "Profile photo"}
        referrerPolicy="no-referrer"
        className={`rounded-full object-cover ring-2 ring-white shrink-0 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-linear-to-br ${gradient} flex items-center justify-center ring-2 ring-white shrink-0 ${sizeClass} ${className}`}
    >
      <span className={`${textSize} font-bold text-white select-none`}>{initials}</span>
    </div>
  );
}
