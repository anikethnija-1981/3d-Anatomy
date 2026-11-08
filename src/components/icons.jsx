import { Bone, Brain, Droplets, Dumbbell, Heart, Utensils, Venus, Wind } from 'lucide-react'

export const SYSTEM_ICONS = {
  heart: Heart,
  wind: Wind,
  brain: Brain,
  bone: Bone,
  dumbbell: Dumbbell,
  utensils: Utensils,
  droplets: Droplets,
  venus: Venus,
}

export function SystemIcon({ name, size = 18, className = '' }) {
  const Icon = SYSTEM_ICONS[name] || Heart
  return <Icon size={size} className={className} />
}
