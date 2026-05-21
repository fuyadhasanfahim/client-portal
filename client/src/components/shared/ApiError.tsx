import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export default function ApiError(error: unknown) {
    if (error instanceof AxiosError) {
        const message =
            error.response?.data?.message || 'An unexpected error occurred.';
        toast.error(message);
    } else if (error && typeof error === 'object' && 'data' in error) {
        // Handle RTK Query / fetchBaseQuery errors
        const rtkError = error as { data?: any };
        let message = 'Something went wrong! Please try again later.';
        
        if (rtkError.data) {
            if (typeof rtkError.data === 'object') {
                message = rtkError.data.error || rtkError.data.message || message;
            } else if (typeof rtkError.data === 'string') {
                message = rtkError.data;
            }
        }
        toast.error(message);
    } else if (error instanceof Error) {
        toast.error(error.message);
    } else {
        toast.error('Something went wrong! Please try again later.');
    }
}
