import { useState } from 'react'
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Props {
    onUploadSuccess?: () => void;
}

export default function DocumentUpload(props: Props) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<string | null>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        simulateUpload(e.dataTransfer.files[0])
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            simulateUpload(e.target.files[0])
        }
    }

    const simulateUpload = async (file: File) => {
        setIsUploading(true)
        try {
            // 1. Upload to Supabase Storage
            // Using 'bank-statements' bucket as per schema
            const fileName = `${Date.now()}-${file.name}`
            const { data, error } = await supabase.storage
                .from('bank-statements')
                .upload(fileName, file)

            if (error) throw error

            // 2. Trigger AI Analysis
            // We need to pass the session token for the API to download the file
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch('/api/engine/analyze-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`
                },
                body: JSON.stringify({
                    filePath: fileName, // Using the path in the bucket
                    fileName: file.name
                }),
            })

            const result = await res.json()
            if (!result.success) throw new Error(result.error)

            setUploadedFile(file.name)

            // Notify parent to refresh data
            if (props.onUploadSuccess) {
                props.onUploadSuccess()
            }

        } catch (error: any) {
            console.error('Upload failed:', error)
            alert(`Upload failed: ${error.message || 'Unknown error'}`)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="glass-effect p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Documents</h2>

            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-blue-400 bg-blue-900/20' : 'border-gray-600 hover:border-blue-400/50 hover:bg-white/5'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleLeave}
                onDrop={handleDrop}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                        <p className="text-blue-300">Processing statement...</p>
                    </div>
                ) : uploadedFile ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                        <p className="text-white font-medium mb-1">Upload Complete!</p>
                        <p className="text-gray-400 text-sm">{uploadedFile}</p>
                        <button
                            onClick={() => setUploadedFile(null)}
                            className="mt-4 text-blue-400 text-sm hover:underline"
                        >
                            Upload another file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="bg-white/10 p-4 rounded-full mb-4">
                            <Upload className="w-8 h-8 text-blue-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Drop your bank statement here
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs">
                            Securely stored in Supabase Vault. We'll automatically extract transactions and classify them.
                        </p>
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Browse Files
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept=".csv,.pdf,.xls,.xlsx"
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    )
}
