import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const Select = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger>
>(({ children, ...props }, ref) => (
  <Popover>
    <PopoverTrigger ref={ref} {...props}>
      {children}
    </PopoverTrigger>
  </Popover>
))
Select.displayName = "Select"

function SelectTrigger({ className, children, ...props }: any) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
    </div>
  )
}

function SelectContent({ children, className }: any) {
  return (
    <PopoverContent className={cn("w-full p-0", className)}>
      <Command>{children}</Command>
    </PopoverContent>
  )
}

function SelectItem({ value, children, onSelect, ...props }: any) {
  return (
    <CommandItem
      onSelect={() => onSelect?.(value)}
      className="cursor-pointer"
      {...props}
    >
      {children}
    </CommandItem>
  )
}

function SelectValue({ children }: any) {
  return <span>{children}</span>
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
}
