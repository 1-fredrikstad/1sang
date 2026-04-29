import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  // Handles logout flow:
  // 1. calls auth logout
  // 2. shows error if it fails
  // 3. always redirects to /admin after attempt
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout failed:', error);
    } finally {
      router.replace('/admin');
    }
  };

  return (
    <AlertDialog>
      {/* Button that opens confirmation dialog */}
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="p-3 text-md cursor-pointer"
          aria-label="Logg ut"
        >
          Logg ut
        </Button>
      </AlertDialogTrigger>

      <AlertDialogPortal>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker på at du vil logge ut?</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogFooter>
            {/* Cancel just closes dialog, no side effects */}
            <AlertDialogCancel variant="outline" aria-label="Avbryt">
              Avbryt
            </AlertDialogCancel>

            {/* Confirm triggers actual logout logic */}
            <AlertDialogAction
              variant="destructive"
              onClick={handleLogout}
              aria-label="Bekreftelse på logg ut"
            >
              Logg ut
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
