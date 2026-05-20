'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
    Mail,
    Phone,
    ShieldCheck,
    User2,
    Clock,
    UserCircle,
    CalendarDays,
    Settings,
    Verified,
    Loader2,
    Camera,
    Key,
    Lock,
    Globe,
    Building,
    Server,
    HardDrive,
    Send,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useLoggedInUser from '@/utils/getLoggedInUser';
import { useState, useRef, useMemo, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useUpdateAvatarMutation,
    useUpdatePasswordMutation,
} from '@/redux/features/users/userApi';
import toast from 'react-hot-toast';
import ApiError from '../../shared/ApiError';
import EditInfoForm from '@/components/auth/EditInfoForm';
import { cn } from '@/lib/utils';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { IService } from '@/types/service.interface';
import {
    useAdditionalServiceMutation,
    useCheckForAdditionalServiceQuery,
} from '@/redux/features/client/clientApi';

export default function ProfilePage() {
    const { user, isLoading } = useLoggedInUser();
    const { userID, email } = user || {};

    const { data, isLoading: isServiceLoading } = useGetServicesQuery(userID!, {
        skip: !userID,
    });

    const services = useMemo(() => {
        if (isServiceLoading || isLoading) return [];

        const userServices = user?.services || [];
        if (userServices.length > 0) return userServices;

        return data?.data?.services || [];
    }, [user?.services, data?.data?.services, isServiceLoading, isLoading]);

    const [updatePassword, { isLoading: isUpdatingPassword }] =
        useUpdatePasswordMutation();
    const [updateAvatar, { isLoading: isUpdatingAvatar }] =
        useUpdateAvatarMutation();
    const [additionalService, { isLoading: isRequesting }] =
        useAdditionalServiceMutation();
    const {
        data: additionalServiceData,
        isLoading: isAdditionalServiceLoading,
    } = useCheckForAdditionalServiceQuery(email!, {
        skip: !email,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRequestService = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!serviceName || Number(servicePrice) <= 0) {
            toast.error('Please provide valid service details');
            return;
        }

        try {
            const res = await additionalService({
                clientEmail: email!,
                serviceName,
                servicePrice: Number(servicePrice),
            }).unwrap();

            if (res.success) {
                toast.success('Service request sent successfully');
                setServiceName('');
                setServicePrice('');
            } else {
                toast.error(res.message || 'Failed to send service request');
            }
        } catch (error) {
            ApiError(error);
        }
    };

    if (isLoading || !user) {
        return (
            <section className="p-6 space-y-6 animate-pulse">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0 flex justify-center">
                        <Skeleton className="h-36 w-36 rounded-full" />
                    </div>
                    <div className="flex-grow space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-20 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            </section>
        );
    }

    const MAX_IMAGE_BYTES = 1 * 1024 * 1024;

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            const mb = (file.size / (1024 * 1024)).toFixed(2);
            toast.error(`Image size should be ≤ 1 MB (selected: ${mb} MB)`);
            e.target.value = '';
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('image', file);

            const res = await updateAvatar({
                userID: user.userID,
                formData,
            }).unwrap();

            if (res.success) {
                toast.success('Profile picture updated successfully');
            } else {
                toast.error(res.message || 'Failed to update avatar');
                setSelectedImage(null);
            }
        } catch (err) {
            ApiError(err);
            setSelectedImage(null);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        try {
            const res = await updatePassword({
                userID: user.userID!,
                currentPassword,
                newPassword,
            }).unwrap();

            if (res.success) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(res.message || 'Failed to update password');
            }
        } catch (err) {
            ApiError(err);
        }
    };

    return (
        <section className="container space-y-6">
            {/* Profile Card */}
            <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
                <CardContent className="relative pt-8 pb-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar Section */}
                        <div className="flex-shrink-0 flex justify-center relative group">
                            <div className="relative">
                                <div className="group relative">
                                    <Avatar className="h-36 w-36 border-4 border-background ring-2 ring-primary/20 group-hover:ring-4 group-hover:ring-primary/30 transition-all duration-300 ease-in-out">
                                        <AvatarImage
                                            src={
                                                selectedImage ||
                                                user.image ||
                                                ''
                                            }
                                            alt={user.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div
                                        className={cn(
                                            'absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300',
                                            isUpdatingAvatar && 'opacity-100'
                                        )}
                                    >
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={cn(
                                                'rounded-full w-12 h-12 hover:bg-primary hover:text-white',
                                                isUpdatingAvatar && 'bg-primary'
                                            )}
                                            onClick={triggerFileInput}
                                            disabled={isUpdatingAvatar}
                                        >
                                            {isUpdatingAvatar ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Camera className="w-5 h-5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    disabled={isUpdatingAvatar}
                                />
                            </div>
                        </div>

                        <div className="flex-grow text-center md:text-left space-y-4 pt-2 md:pt-0">
                            <div className="space-y-3">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">
                                        {user.name}
                                    </h2>
                                    <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                                        <span className="text-muted-foreground text-lg">
                                            @{user.username}
                                        </span>
                                        <Badge
                                            variant={
                                                user.isEmailVerified
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                            className="gap-1"
                                        >
                                            {user.isEmailVerified ? (
                                                <>
                                                    <Verified size={16} />
                                                    Verified
                                                </>
                                            ) : (
                                                'Unverified'
                                            )}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border hover:border-primary/30 transition-colors">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4 text-primary" />
                                        Email
                                    </Label>
                                    <span className="text-sm font-medium">
                                        {user.email}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border hover:border-primary/30 transition-colors">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4 text-primary" />
                                        Phone
                                    </Label>
                                    <span className="text-sm font-medium">
                                        {user.phone || 'Not set'}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border hover:border-primary/30 transition-colors">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Globe className="w-4 h-4 text-primary" />
                                        Address
                                    </Label>
                                    <span className="text-sm font-medium capitalize">
                                        {user.address}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center md:items-start gap-1 p-3 bg-background/50 rounded-lg border hover:border-primary/30 transition-colors">
                                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building className="w-4 h-4 text-primary" />
                                        Company
                                    </Label>
                                    <span className="text-sm font-medium">
                                        {user.company}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-4 right-4">
                        <EditInfoForm user={user} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card className="border-primary/20 hover:border-primary/40 transition-colors duration-300">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <UserCircle className="w-5 h-5 text-primary" />
                                Account Details
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 hover:bg-primary/10 hover:text-primary"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-3 hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                            <div className="flex items-center gap-2 text-sm">
                                <User2 className="w-4 h-4 text-muted-foreground" />
                                <span>Sign In Method</span>
                            </div>
                            <span className="font-medium text-sm capitalize">
                                {user.provider}
                            </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-3 hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                                <span>Verification Status</span>
                            </div>
                            <Badge
                                variant={
                                    user.isEmailVerified
                                        ? 'default'
                                        : 'destructive'
                                }
                                className="gap-1"
                            >
                                {user.isEmailVerified ? (
                                    <>
                                        <Verified size={14} />
                                        Verified
                                    </>
                                ) : (
                                    'Unverified'
                                )}
                            </Badge>
                        </div>

                        <div className="flex justify-between items-center border-b pb-3 hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>Last Login</span>
                            </div>
                            <span className="font-medium text-sm">
                                {user.lastLogin
                                    ? format(
                                          new Date(user.lastLogin),
                                          'MMM d, p'
                                      )
                                    : 'N/A'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center hover:bg-muted/50 px-2 py-1 rounded transition-colors">
                            <div className="flex items-center gap-2 text-sm">
                                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                <span>Member Since</span>
                            </div>
                            <span className="font-medium text-sm">
                                {user.createdAt &&
                                    format(
                                        new Date(user.createdAt),
                                        'MMM yyyy'
                                    )}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                {user.provider !== 'google' && (
                    <Card className="border-primary/20 hover:border-primary/40 transition-colors duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>
                                Manage your password and account security
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                    <Key className="w-4 h-4" />
                                    Change Password
                                </Label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="current-password"
                                            className="text-xs"
                                        >
                                            Current Password
                                        </Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-9 border-primary/30 focus:border-primary/50"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(
                                                    e.target.value
                                                )
                                            }
                                            disabled={isUpdatingPassword}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="new-password"
                                            className="text-xs"
                                        >
                                            New Password
                                        </Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-9 border-primary/30 focus:border-primary/50"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            disabled={isUpdatingPassword}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="confirm-password"
                                            className="text-xs"
                                        >
                                            Confirm Password
                                        </Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="h-9 border-primary/30 focus:border-primary/50"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            disabled={isUpdatingPassword}
                                        />
                                    </div>
                                </div>
                                {newPassword &&
                                    confirmPassword &&
                                    newPassword !== confirmPassword && (
                                        <p className="text-sm text-destructive">
                                            Passwords don&apos;t match
                                        </p>
                                    )}
                                {newPassword && newPassword.length < 8 && (
                                    <p className="text-sm text-destructive">
                                        Password must be at least 8 characters
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="ml-auto shadow-sm hover:shadow-md transition-shadow"
                                onClick={handleChangePassword}
                                disabled={
                                    isUpdatingPassword ||
                                    !currentPassword ||
                                    !newPassword ||
                                    !confirmPassword ||
                                    newPassword !== confirmPassword ||
                                    newPassword.length < 8
                                }
                            >
                                {isUpdatingPassword ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : null}
                                {isUpdatingPassword
                                    ? 'Updating...'
                                    : 'Save Security Settings'}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {user?.role !== 'admin' && user?.isTeamMember === false && (
                    <Card className="border-primary/20 hover:border-primary/40 transition-colors duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="w-5 h-5 text-primary" />
                                Services
                            </CardTitle>
                            <CardDescription>
                                The list of services you have access to
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ul className="space-y-4 list-inside list-decimal">
                                {services.map((service: IService) => (
                                    <li key={service._id} className="ml-2">
                                        {service.name}
                                    </li>
                                ))}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="secondary" size="sm">
                                            <HardDrive />
                                            Request for additional Service
                                        </Button>
                                    </DialogTrigger>
                                    {!isAdditionalServiceLoading &&
                                    additionalServiceData &&
                                    additionalServiceData?.data ? (
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">
                                                    You have already requested a
                                                    service
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Our team is reviewing your
                                                    request for additional
                                                    services. We will notify you
                                                    once it is approved.
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    ) : (
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl">
                                                    Request Additional Service
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Please fill out the form
                                                    below. Our team will review
                                                    your request and get back to
                                                    you shortly.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form
                                                onSubmit={handleRequestService}
                                                className="space-y-4"
                                            >
                                                <div className="grid gap-4 grid-cols-2">
                                                    {/* Service Name */}
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="service-name">
                                                            Service Name
                                                        </Label>
                                                        <Input
                                                            id="service-name"
                                                            name="service-name"
                                                            type="text"
                                                            placeholder="Enter the service name"
                                                            value={serviceName}
                                                            onChange={(e) =>
                                                                setServiceName(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                    {/* Service Price */}
                                                    <div className="grid gap-3">
                                                        <Label htmlFor="service-price">
                                                            Service Price
                                                        </Label>
                                                        <Input
                                                            id="service-price"
                                                            name="service-price"
                                                            type="number"
                                                            value={servicePrice}
                                                            onChange={(e) =>
                                                                setServicePrice(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            min={0}
                                                            step={0.01}
                                                            required
                                                            placeholder="Enter the service price"
                                                        />
                                                    </div>

                                                    {/* Submit Button */}
                                                    <div className="col-span-2 mt-3">
                                                        <Button
                                                            type="submit"
                                                            className="w-full"
                                                            disabled={
                                                                !serviceName ||
                                                                Number(
                                                                    servicePrice
                                                                ) <= 0 ||
                                                                isRequesting
                                                            }
                                                        >
                                                            {isRequesting ? (
                                                                <Loader2 className="animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Send />
                                                                    Send Request
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    )}
                                </Dialog>
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </section>
    );
}
