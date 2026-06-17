import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { ShellClient } from "./ShellClient"

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ShellClient>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <div className="flex-1">{children}</div>
      </div>
    </ShellClient>
  )
}
