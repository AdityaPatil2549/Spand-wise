'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useStore } from '@/store';
import { updateUserProfileInfo } from '@/lib/firebase/auth';
import type { User } from 'firebase/auth';

const profileSchema = z.object({
 displayName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long'),
 photoURL: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
 onSuccess?: () => void;
}

export const EditProfileForm = ({ onSuccess }: EditProfileFormProps) => {
 const user = useStore((s) => s.user);
 const addToast = useStore((s) => s.addToast);
 // We manually trigger an update to Zustand store's user since the listener might not fire
 // immediately for profile-only updates depending on Firebase caching.
 const setUser = useStore((s) => s.setUser);

 const {
 register,
 handleSubmit,
 formState: { errors, isSubmitting },
 } = useForm<ProfileForm>({
 resolver: zodResolver(profileSchema),
 defaultValues: {
 displayName: user?.displayName ?? '',
 photoURL: user?.photoURL ?? '',
 },
 });

 const onSubmit = async (data: ProfileForm) => {
 if (!user) return;
 
 // Clean up empty photoURL
 const photoURL = data.photoURL?.trim() || undefined;

 try {
 await updateUserProfileInfo(user, {
 displayName: data.displayName,
 photoURL,
 });

 const updatedUser = {
 ...user,
 displayName: data.displayName,
 photoURL: photoURL ?? null,
 } as User; 
 
 setUser(updatedUser);
 addToast({ type: 'success', message: 'Profile updated successfully! ✨' });
 
 if (onSuccess) {
 onSuccess();
 }
 } catch (err) {
 console.error('[EditProfile]', err);
 addToast({ type: 'error', message: 'Failed to update profile. Please try again.' });
 }
 };

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
 <Input
 label="Display Name"
 type="text"
 placeholder="Jane Doe"
 {...register('displayName')}
 error={errors.displayName?.message}
 />
 
 <Input
 label="Profile Picture URL"
 type="url"
 placeholder="https://example.com/avatar.jpg (Optional)"
 {...register('photoURL')}
 error={errors.photoURL?.message}
 />

 <div className="pt-2">
 <Button type="submit" variant="primary" fullWidth size="lg" isLoading={isSubmitting}>
 Save Changes
 </Button>
 </div>
 </form>
 );
};
