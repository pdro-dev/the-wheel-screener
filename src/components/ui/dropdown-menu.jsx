import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children, className }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div className={cn("relative inline-block text-left", className)}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen, className }) => (
  <button
    onClick={() => setIsOpen(!isOpen)}
    className={cn(
      "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
  >
    {children}
    <ChevronDown className="ml-1 h-4 w-4" />
  </button>
)

const DropdownMenuContent = ({ children, isOpen, setIsOpen, className }) => {
  if (!isOpen) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsOpen(false)}
      />
      <div className={cn(
        "absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        className
      )}>
        {children}
      </div>
    </>
  )
}

const DropdownMenuItem = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
      className
    )}
  >
    {children}
  </button>
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}
