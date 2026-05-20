import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export default function ApiError(error: unknown) {
    if (error instanceof AxiosError) {
        const message =
            error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(message);
    } else if (error instanceof Error) {
        toast.error(error.message);
    } else {
        toast.error('Something went wrong! Please try again later.');
    }
}
