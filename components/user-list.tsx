import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"

interface User {
    id: number | string,
    name: string,
    description: string,
    avatar: string,
}

export function UserList({ users, onSelect }: { users: User[], onSelect: (id: number | string) => void }) {
    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-8 bg-background overflow-y-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Recitations</h1>
                    <p className="text-sm text-muted-foreground">Selecte your prefered reciter</p>
                </div>
            </div>

            <div className="sticky top-0 z-50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Filter reciters..."
                    className="pl-9 max-w-sm h-9 bg-muted/50 border-none focus-visible:ring-1"
                />
            </div>

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <div className="divide-y">
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className="group flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => onSelect(user.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium leading-none group-hover:underline">{user.name}</span>
                                    <span className="text-xs text-muted-foreground mt-1">{user.description}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
