'use client'
import React from 'react'
import { FunFactProps } from '@/types/FunFact'
import FunFactCard from './FunFactCard'
import Navigation from './Navigation'

const FunFactDisplay: React.FC<FunFactProps | null> = (props) => {
    if (!props) {
        return <p>No fun fact found for today.</p>
    }

    return (
        <main className="container mx-auto p-8 bg-gray-100 min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4 text-center text-black">Daily Fun Facts</h1>
            <FunFactCard {...props} />
            <Navigation date={props.date} />
        </main>
    )
}

export default FunFactDisplay
