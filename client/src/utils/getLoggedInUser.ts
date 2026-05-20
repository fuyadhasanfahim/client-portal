import { useGetMeQuery } from '@/redux/features/users/userApi';
import { ISanitizedUser } from '@/types/user.interface';

export default function useLoggedInUser() {
    const { data, isLoading, error } = useGetMeQuery({});

    return {
        user: isLoading ? {} : data?.data ?? {} as ISanitizedUser,
        isLoading,
        error,
    };
}
