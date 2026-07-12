import { useAppContext } from "@/lib/context/app-context";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

const UserCard = () => {
    let { user } = useAppContext()
    let username = user?.first_name
}