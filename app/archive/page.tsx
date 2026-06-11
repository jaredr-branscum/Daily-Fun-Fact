'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import FunFactCard from '@/components/FunFactCard'
import { FunFactProps } from '@/types/FunFact'
import Link from 'next/link'

type AllFunFacts = { [date: string]: FunFactProps }

// API date key format: YYYY-DD-MM (e.g. "2025-25-02" = Feb 25 2025)
function extractYear(dateKey: string): string {
    return dateKey.split('-')[0]
}

function extractMonth(dateKey: string): string {
    return dateKey.split('-')[2]
}

function getAvailableYears(allFunFacts: AllFunFacts): string[] {
    return Array.from(new Set(Object.keys(allFunFacts).map(extractYear))).sort((a, b) => Number(b) - Number(a))
}

function getAvailableMonthsForYear(allFunFacts: AllFunFacts, year: string): string[] {
    return Array.from(
        new Set(
            Object.keys(allFunFacts)
                .filter((d) => extractYear(d) === year)
                .map(extractMonth),
        ),
    ).sort((a, b) => Number(b) - Number(a))
}

function getFactsForYearMonth(allFunFacts: AllFunFacts, year: string, month: string): FunFactProps[] {
    return Object.entries(allFunFacts)
        .filter(([date]) => extractYear(date) === year && extractMonth(date) === month)
        .map(([, fact]) => fact)
}

function deriveLatestYearMonth(allFunFacts: AllFunFacts): { year: string; month: string } | null {
    const years = getAvailableYears(allFunFacts)
    if (years.length === 0) return null
    const latestYear = years[0]
    const months = getAvailableMonthsForYear(allFunFacts, latestYear)
    if (months.length === 0) return null
    return { year: latestYear, month: months[0] }
}

function monthLabel(month: string): string {
    return new Date(2000, Number(month) - 1, 1).toLocaleString('default', { month: 'long' })
}

function ArchiveContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [allFunFacts, setAllFunFacts] = useState<AllFunFacts>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const [search, setSearch] = useState('')

    const yearParam = searchParams?.get('year') ?? ''
    const monthParam = searchParams?.get('month') ?? ''

    useEffect(() => {
        async function fetchFunFacts() {
            try {
                setLoading(true)
                const res = await fetch('/api/funfacts')
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                const data: AllFunFacts = await res.json()
                setAllFunFacts(data)
            } catch (err: unknown) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'))
            } finally {
                setLoading(false)
            }
        }
        fetchFunFacts()
    }, [])

    // When data loads without URL params, default to the latest available month
    useEffect(() => {
        if (Object.keys(allFunFacts).length === 0) return
        if (yearParam && monthParam) return
        const latest = deriveLatestYearMonth(allFunFacts)
        if (!latest) return
        const params = new URLSearchParams()
        params.set('year', latest.year)
        params.set('month', latest.month)
        router.replace(`/archive?${params.toString()}`)
    }, [allFunFacts, yearParam, monthParam, router])

    const availableYears = useMemo(() => getAvailableYears(allFunFacts), [allFunFacts])

    const availableMonths = useMemo(
        () => (yearParam ? getAvailableMonthsForYear(allFunFacts, yearParam) : []),
        [allFunFacts, yearParam],
    )

    const factsForMonth = useMemo(() => {
        if (!yearParam || !monthParam) return []
        return getFactsForYearMonth(allFunFacts, yearParam, monthParam)
    }, [allFunFacts, yearParam, monthParam])

    const filteredFacts = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return factsForMonth
        return factsForMonth.filter(
            (f) =>
                f.fact.toLowerCase().includes(term) ||
                f.topic.toLowerCase().includes(term) ||
                f.tags?.some((t) => t.toLowerCase().includes(term)),
        )
    }, [factsForMonth, search])

    function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newYear = e.target.value
        const months = getAvailableMonthsForYear(allFunFacts, newYear)
        const params = new URLSearchParams()
        params.set('year', newYear)
        if (months[0]) params.set('month', months[0])
        router.push(`/archive?${params.toString()}`)
        setSearch('')
    }

    function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const params = new URLSearchParams(searchParams?.toString() ?? '')
        params.set('month', e.target.value)
        router.push(`/archive?${params.toString()}`)
        setSearch('')
    }

    if (loading) return <p>Loading fun facts...</p>
    if (error) return <p>Error loading fun facts: {error.message}</p>

    const resultLabel =
        filteredFacts.length === factsForMonth.length ? (
            <span>
                {filteredFacts.length} fact{filteredFacts.length !== 1 ? 's' : ''} in {monthLabel(monthParam)}{' '}
                {yearParam}
            </span>
        ) : (
            <span>
                {filteredFacts.length} of {factsForMonth.length} facts match &ldquo;{search}&rdquo;
            </span>
        )

    return (
        <main className="container mx-auto p-8 bg-gray-100 min-h-screen flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-center text-black" data-testid="fun-fact-archive">
                Fun Facts Archive
            </h1>

            <div className="flex justify-center mb-4 space-x-4">
                <select
                    value={yearParam}
                    onChange={handleYearChange}
                    className="select-style"
                    data-testid="fun-fact-archive-select-year"
                >
                    <option value="">Select a Year</option>
                    {availableYears.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>

                <select
                    value={monthParam}
                    onChange={handleMonthChange}
                    className="select-style"
                    data-testid="fun-fact-archive-select-month"
                    disabled={!yearParam}
                >
                    <option value="">Select a Month</option>
                    {availableMonths.map((month) => (
                        <option key={month} value={month}>
                            {monthLabel(month)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="w-full max-w-md mb-4">
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search facts, topics, or tags..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="fun-fact-archive-search"
                    aria-label="Search archived fun facts"
                />
            </div>

            {yearParam && monthParam && (
                <p className="text-sm text-black mb-4" data-testid="fun-fact-archive-result-count">
                    {resultLabel}
                </p>
            )}

            {yearParam && monthParam && factsForMonth.length === 0 && (
                <div className="alert-banner" role="alert">
                    <p className="font-bold">No Fun Facts Available</p>
                    <p>
                        There are no fun facts available for {monthLabel(monthParam)} {yearParam}.
                    </p>
                </div>
            )}

            {search && filteredFacts.length === 0 && factsForMonth.length > 0 && (
                <div className="alert-banner" role="alert">
                    <p>
                        No facts match &ldquo;{search}&rdquo; in {monthLabel(monthParam)} {yearParam}.
                    </p>
                </div>
            )}

            {filteredFacts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredFacts.map((funFact) => (
                        <FunFactCard key={funFact.date} {...funFact} />
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

export default function ArchivePage() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ArchiveContent />
        </Suspense>
    )
}
