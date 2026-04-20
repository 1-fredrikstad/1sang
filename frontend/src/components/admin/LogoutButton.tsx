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
            <AlertDialogCancel variant="outline" aria-label="Avbryt">
              Avbryt
            </AlertDialogCancel>
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
