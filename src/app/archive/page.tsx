'use client'

import React, { useState, useEffect, useCallback } from 'react'
import FunFactCard from '@/components/FunFactCard'
import { FunFactProps } from '@/types/FunFact'
import Link from 'next/link'

const ArchivePage: React.FC = () => {
    const [allFunFacts, setAllFunFacts] = useState<{ [date: string]: FunFactProps }>({})
    const [selectedYear, setSelectedYear] = useState('')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [funFactsToDisplay, setFunFactsToDisplay] = useState<FunFactProps[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function fetchFunFacts() {
            try {
                setLoading(true)
                const res = await fetch('/api/funfacts')
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`)
                }
                const data = await res.json()
                setAllFunFacts(data)
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err)
                } else {
                    setError(new Error('An unknown error occurred'))
                }
            } finally {
                setLoading(false)
            }
        }

        fetchFunFacts()
    }, [])

    const availableYears = Array.from(new Set(Object.keys(allFunFacts).map((date) => date.slice(0, 4)))).sort(
        (a, b) => Number(b) - Number(a),
    ) // Sort in descending order
    const allMonths = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

    const filterFunFacts = useCallback(() => {
        if (selectedYear && selectedMonth) {
            const filteredFunFacts = Object.keys(allFunFacts)
                .filter((date) => {
                    const [year, day, month] = date.split('-')
                    const formattedDate = `${year}-${month}-${day}`
                    return formattedDate.startsWith(`${selectedYear}-${selectedMonth}`)
                })
                .map((date) => allFunFacts[date])
            setFunFactsToDisplay(filteredFunFacts)
        } else {
            setFunFactsToDisplay([])
        }
    }, [selectedYear, selectedMonth, allFunFacts])

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(event.target.value)
    }

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedMonth(event.target.value)
    }

    useEffect(() => {
        filterFunFacts()
    }, [filterFunFacts])

    if (loading) {
        return <p>Loading fun facts...</p>
    }

    if (error) {
        return <p>Error loading fun facts: {error.message}</p>
    }

    return (
        <main className="container mx-auto p-8 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4 text-center text-black">Fun Facts Archive</h1>

            <div className="flex justify-center mb-6 space-x-4">
                <select value={selectedYear} onChange={handleYearChange} className="select-style">
                    <option value="">Select a Year</option>
                    {availableYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>

                <select value={selectedMonth} onChange={handleMonthChange} className="select-style">
                    <option value="">Select a Month</option>
                    {allMonths.map((month) => (
                        <option key={month} value={month}>
                            {new Date(2000, Number(month) - 1, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
            </div>

            {selectedYear && selectedMonth && funFactsToDisplay.length === 0 && (
                <div className="alert-banner" role="alert">
                    <p className="font-bold">No Fun Facts Available</p>
                    <p>There are no fun facts available for the selected month and year.</p>
                </div>
            )}

            {funFactsToDisplay.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {funFactsToDisplay.map((funFact, index) => (
                        <FunFactCard key={index} {...funFact} />
                    ))}
                </div>
            )}
            <div className="flex justify-center mt-6">
                <Link href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Back to Today&apos;s Fun Fact
                </Link>
            </div>
        </main>
    )
}

export default ArchivePage
