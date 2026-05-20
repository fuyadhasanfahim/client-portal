'use client';

import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';

export default function SigninWithFGoogleButton() {
    return (
        <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => signIn('google')}
        >
            <FcGoogle className="mr-2 size-5" />
            Sign In With Google
        </Button>
    );
}
