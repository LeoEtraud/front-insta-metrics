import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success:
          "border-green-500/50 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-100 shadow-green-500/20",
        warning:
          "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-900 dark:text-yellow-100 shadow-yellow-500/20",
        info:
          "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 shadow-blue-500/20",
        destructive:
          "border-red-500/50 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-100 shadow-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      // Default
      "border-border hover:bg-secondary focus:ring-ring",
      // Success
      "group-[.success]:border-green-300 dark:group-[.success]:border-green-700 group-[.success]:hover:bg-green-100 dark:group-[.success]:hover:bg-green-900/30 group-[.success]:hover:text-green-900 dark:group-[.success]:hover:text-green-100 group-[.success]:focus:ring-green-400",
      // Warning
      "group-[.warning]:border-yellow-300 dark:group-[.warning]:border-yellow-700 group-[.warning]:hover:bg-yellow-100 dark:group-[.warning]:hover:bg-yellow-900/30 group-[.warning]:hover:text-yellow-900 dark:group-[.warning]:hover:text-yellow-100 group-[.warning]:focus:ring-yellow-400",
      // Info
      "group-[.info]:border-blue-300 dark:group-[.info]:border-blue-700 group-[.info]:hover:bg-blue-100 dark:group-[.info]:hover:bg-blue-900/30 group-[.info]:hover:text-blue-900 dark:group-[.info]:hover:text-blue-100 group-[.info]:focus:ring-blue-400",
      // Destructive
      "group-[.destructive]:border-red-300 dark:group-[.destructive]:border-red-700 group-[.destructive]:hover:bg-red-100 dark:group-[.destructive]:hover:bg-red-900/30 group-[.destructive]:hover:text-red-900 dark:group-[.destructive]:hover:text-red-100 group-[.destructive]:focus:ring-red-400",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      // Default
      "text-foreground/50 hover:text-foreground",
      // Success
      "group-[.success]:text-green-700 dark:group-[.success]:text-green-300 group-[.success]:hover:text-green-900 dark:group-[.success]:hover:text-green-100 group-[.success]:focus:ring-green-400",
      // Warning
      "group-[.warning]:text-yellow-700 dark:group-[.warning]:text-yellow-300 group-[.warning]:hover:text-yellow-900 dark:group-[.warning]:hover:text-yellow-100 group-[.warning]:focus:ring-yellow-400",
      // Info
      "group-[.info]:text-blue-700 dark:group-[.info]:text-blue-300 group-[.info]:hover:text-blue-900 dark:group-[.info]:hover:text-blue-100 group-[.info]:focus:ring-blue-400",
      // Destructive
      "group-[.destructive]:text-red-700 dark:group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-900 dark:group-[.destructive]:hover:text-red-100 group-[.destructive]:focus:ring-red-400",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
