import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { getMimeType } from '@/utils/mimeType'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    try {
        const { filePath, fileName } = req.body

        if (!filePath) {
            return res.status(400).json({ success: false, error: 'File path is required' })
        }

        // Initialize Supabase Client with User's Auth Context (Forwarding the JWT)
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' })
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: authHeader,
                    },
                },
            }
        )

        // 0. Authenticate User immediately (Fail Fail)
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' })
        }

        // 1. Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase
            .storage
            .from('bank-statements')
            .download(filePath)

        if (downloadError || !fileData) {
            console.error('Download error:', downloadError)
            return res.status(500).json({ success: false, error: `Storage download failed: ${downloadError?.message}` })
        }

        // 2. Convert to Base64 for Gemini
        const arrayBuffer = await fileData.arrayBuffer()
        const base64Data = Buffer.from(arrayBuffer).toString('base64')
        const mimeType = getMimeType(fileName)

        // 3. Analyze with Gemini
        // Using 'gemini-flash-latest' as a stable fallback for multimodal input.
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

        const prompt = `
            Analyze this bank statement and extract all transactions.
            
            Output strictly a JSON array of objects with these fields:
            - date (YYYY-MM-DD or DD/MM/YYYY)
            - description (string)
            - amount (number)
            - type (DEBIT or CREDIT)
            - category (strictly one of: Food, Shopping, Travel, P2P Transfer, Salary, Utilities, Investment, Medical, Entertainment, Business, Personal, Insurance, NPS)
            - merchant_name (string, extracted or inferred)
            
            Do not include markdown or explanations. Just the JSON array.
        `

        // Use inlineData for sending the file content
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ])

        const responseText = result.response.text()

        // Clean JSON
        let jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim()

        // Extract array if there's extra text
        const firstBracket = jsonStr.indexOf('[')
        const lastBracket = jsonStr.lastIndexOf(']')

        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1)
        }

        let transactions = []
        try {
            transactions = JSON.parse(jsonStr)
        } catch (e) {
            console.error('JSON Parse error:', e, 'Raw text:', responseText)
            return res.status(500).json({ success: false, error: 'AI processed the file but the output format was invalid. Please try again.' })
        }

        if (!Array.isArray(transactions)) {
            // Handle nested object structure if valid
            if ((transactions as any).transactions && Array.isArray((transactions as any).transactions)) {
                transactions = (transactions as any).transactions
            } else {
                return res.status(500).json({ success: false, error: 'AI output was not an array' })
            }
        }

        // 4. Save to Database
        // Note: user is already authenticated at the top of the handler

        // A. Create Bank Statement Record
        const { data: statementData, error: statementError } = await supabase
            .from('bank_statements')
            .insert({
                user_id: user.id,
                filename: fileName,
                file_path: filePath,
                status: 'processed',
                processed_at: new Date().toISOString()
            })
            .select()
            .single()

        if (statementError) {
            console.error('DB Insert Statement Error:', statementError)
            // We don't fail the request if saving fails, but we should log it. 
            // Or maybe we should return success with a warning? 
            // For now, let's just log and return the data so the user sees it.
        } else if (statementData) {
            // B. Bulk Insert Transactions
            const dbTransactions = transactions.map((t: any) => ({
                statement_id: statementData.id,
                user_id: user.id,
                date: t.date,
                description: t.description,
                amount: typeof t.amount === 'string' ? parseFloat(t.amount.replace(/,/g, '')) : t.amount,
                type: t.type?.toUpperCase() === 'CREDIT' ? 'CREDIT' : 'DEBIT',
                category: t.category,
                merchant_name: t.merchant_name || null
            }))

            const { error: insertError } = await supabase
                .from('statement_transactions')
                .insert(dbTransactions)

            if (insertError) {
                console.error('DB Insert Transactions Error:', insertError)
            } else {
                console.log(`Saved ${dbTransactions.length} transactions to DB for user ${user.id}`)
            }
        }

        return res.status(200).json({ success: true, data: transactions })

    } catch (error: any) {
        console.error('Analysis error:', error)
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' })
    }
}
