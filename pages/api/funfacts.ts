import { promises as fs } from 'fs'
import path from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'
import { FunFactProps } from '@/types/FunFact'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const allFunFacts = await getAllFunFacts()
        res.status(200).json(allFunFacts)
    } catch (error) {
        console.error('Error fetching fun facts:', error)
        res.status(500).json({ error: 'Failed to fetch fun facts' })
    }
}

async function getAllFunFacts(): Promise<{ [date: string]: FunFactProps }> {
    const allFunFacts: { [date: string]: FunFactProps } = {}
    const dataDir = path.join(process.cwd(), 'data')

    try {
        const years = await fs.readdir(dataDir)
        if (!years || years.length === 0) {
            // Check if no years are found
            console.warn('No years found in data directory. Check your data structure.')
            return {} // Return empty object if no years are found
        }

        for (const year of years) {
            const yearDir = path.join(dataDir, year)
            console.debug('Year directory:', yearDir)
            const months = await fs.readdir(yearDir)
            console.debug(`Months found in ${year}:`, months)

            if (!months || months.length === 0) {
                // Check if no months are found
                console.warn(`No months found in ${year}. Check your data structure.`)
                continue // Skip to the next year
            }

            for (const month of months) {
                const monthDir = path.join(yearDir, month)
                console.debug('Month directory:', monthDir)
                const files = await fs.readdir(monthDir)
                console.debug(`Files found in ${year}/${month}:`, files)

                if (!files || files.length === 0) {
                    // Check if no files are found
                    console.warn(`No files found in ${year}/${month}. Check your data structure.`)
                    continue // Skip to the next month
                }

                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const date = file.slice(0, 10)
                        const [day, m, y] = date.split('-')
                        const correctDateFormat = `${y}-${m}-${day}`

                        console.debug(`Processing file: ${file}, date: ${correctDateFormat}`)

                        const funFact = await getFunFactData(file)

                        if (funFact) {
                            allFunFacts[correctDateFormat] = funFact
                            console.debug(`Fun fact added for ${correctDateFormat}:`, funFact)
                        } else {
                            console.debug(`No fun fact found for ${correctDateFormat}`)
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error reading fun facts:', error)
    }

    console.debug('All fun facts:', allFunFacts)
    return allFunFacts
}

async function getFunFactData(filename: string): Promise<FunFactProps | null> {
    const [month, day, year] = filename.slice(0, 10).split('-')
    const filepath = path.join(process.cwd(), 'data', year, month, filename)

    console.debug('Filepath:', filepath)

    try {
        const fileContents = await fs.readFile(filepath, 'utf8')
        console.debug('File contents:', fileContents)

        const data: FunFactProps = JSON.parse(fileContents)
        return { ...data, date: `${year}-${month}-${day}` }
    } catch (error) {
        console.error(`Error reading/parsing ${filename}:`, error)
        return null
    }
}
