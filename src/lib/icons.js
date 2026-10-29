import {
  AirVent,
  CalendarCheck,
  Car,
  Droplets,
  GraduationCap,
  Hammer,
  Paintbrush,
  Scissors,
  Search,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react'

const iconMap = [
  ['clean', Sparkles],
  ['plumb', Droplets],
  ['electric', Zap],
  ['carpent', Hammer],
  ['paint', Paintbrush],
  ['ac', AirVent],
  ['mov', Truck],
  ['tutor', GraduationCap],
  ['beaut', Scissors],
  ['car', Car],
]

export function categoryIcon(name) {
  const key = (name || '').toLowerCase()
  const match = iconMap.find(([keyword]) => key.includes(keyword))
  return match ? match[1] : Wrench
}

export const stepIcons = {
  search: Search,
  compare: SlidersHorizontal,
  book: CalendarCheck,
}
