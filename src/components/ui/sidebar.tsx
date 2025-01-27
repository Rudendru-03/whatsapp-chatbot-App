"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "4rem"

type SidebarContext = {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>{children}</SidebarContext.Provider>
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

function Sidebar({ className, children, ...props }: SidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-background transition-[width]",
        isCollapsed ? "w-[4rem]" : "w-[16rem]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("flex h-14 items-center border-b px-4", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> { }

function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> { }

function SidebarMenu({ className, children, ...props }: SidebarMenuProps) {
  return (
    <div className={cn("flex flex-col gap-1 p-2", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> { }

function SidebarMenuItem({ className, children, ...props }: SidebarMenuItemProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  )
}

const sidebarMenuButtonVariants = cva(
  "relative flex w-full items-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "text-foreground/70 hover:text-foreground",
        active: "bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "active"
  asChild?: boolean
}

const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, variant, asChild = false, children, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    const Comp = asChild ? Slot : "button"

    return (
      <Comp ref={ref} className={cn(sidebarMenuButtonVariants({ variant }), className)} {...props}>
        {children}
        {isCollapsed && <span className="sr-only">{typeof children === "string" ? children : "Item"}</span>}
      </Comp>
    )
  },
)
SidebarMenuButton.displayName = "SidebarMenuButton"

interface SidebarTriggerProps extends React.HTMLAttributes<HTMLButtonElement> { }

function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={() => setIsCollapsed(!isCollapsed)}
      {...props}
    >
      <PanelLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> { }

function SidebarInset({ className, children, ...props }: SidebarInsetProps) {
  return (
    <div className={cn("flex flex-col p-2", className)} {...props}>
      {children}
    </div>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}

