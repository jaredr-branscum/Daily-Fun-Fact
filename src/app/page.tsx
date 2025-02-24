import FunFactDisplay from '@/components/FunFactDisplay'
import { promises as fs } from 'fs'
import path from 'path'
import { format } from 'date-fns'

// Expected format of date string: YYYY-MM-DD
async function getFunFactData(date: string) {
    const [year, month, day] = date.slice(0, 10).split('-')
    const filename = `${month}-${day}-${year}.json`
    const filepath = path.join(process.cwd(), 'data', year, month, filename)

    try {
        const fileContents = await fs.readFile(filepath, 'utf8')
        const data = JSON.parse(fileContents)
        return data
    } catch (error) {
        console.error(`Error reading fun fact for ${date}:`, error)
        return null
    }
}

async function loadFunFact(today: string) {
    try {
        return await getFunFactData(today)
    } catch (error) {
        console.error('Error loading fun fact:', error)
        return null
    }
}

export default async function Home() {
    const date = new Date()
    const today = format(date, 'yyyy-MM-dd')
    const funFactData = await loadFunFact(today)
    return (
        <>
            <FunFactDisplay {...funFactData} date={today} />
        </>
    )
}
