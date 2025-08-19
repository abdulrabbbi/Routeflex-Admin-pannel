import { toast } from "react-toastify";

export const handleSuccess = (message: string) => {
  toast.success(message);
};

export const handleError = (error: any, defaultMessage: string) => {
  const errorMsg =
    error?.response?.data?.message || error?.message || defaultMessage;
  toast.error(errorMsg);
};