
import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import DocumentUpload from './DocumentUpload'

interface UploadStatementModalProps {
    onUploadSuccess?: () => void
}

export default function UploadStatementModal({ onUploadSuccess }: UploadStatementModalProps) {
    const [open, setOpen] = useState(false)

    const handleSuccess = () => {
        if (onUploadSuccess) onUploadSuccess()
        // Optional: Close modal automatically or let user close it
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-white/10 hover:bg-white/5 mr-2">
                    <Upload className="w-4 h-4 mr-2" /> Upload Statement
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#151A25] border-white/10 text-white sm:max-w-xl p-0 overflow-hidden">
                <DocumentUpload onUploadSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}
