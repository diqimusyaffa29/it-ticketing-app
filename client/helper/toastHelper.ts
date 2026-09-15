import { toast } from "sonner"

export const toastSuccess = (message: string) => {
    toast.success(message, {
        style: { backgroundColor: "#ECFDF3", color: "green" },
    })
}

export const toastError = (message: string) => {
    toast.error(message, {
        style: { backgroundColor: "#FFF0F0", color: "red" }
    })
}

export const toastUpdate = (message: string) => {
    toast.info(message, {
        style: { backgroundColor: "#0084D1", color: "white" }
    })
}

export const toastWarning = (message: string) => {
    toast.warning(message, {
        style: { backgroundColor: "#FFFCF0", color: "#DC7609" }
    })
}