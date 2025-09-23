import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Shield, User } from "lucide-react"
import { type User as UserType } from "@/types/user"

interface UserAvatarProps {
  user: UserType
}

export default function UserAvatar({ user }: UserAvatarProps) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase()
  const imageSrc = user.role === 'admin' ? '/admin.jpg' : '/customer.jpg'

  return (
    <div className="relative">
      <Avatar>
        <AvatarImage src={imageSrc} alt={user.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200">
        {user.role === 'admin' ? (
          <Shield className="h-3 w-3 text-slate-900" />
        ) : (
          <User className="h-3 w-3 text-slate-600" />
        )}
      </span>
    </div>
  )
}
