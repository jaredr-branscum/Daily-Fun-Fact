import React from 'react'
import Link from 'next/link'

interface NavigationProps {
    date: string
}

const Navigation: React.FC<NavigationProps> = () => {
    return (
        <div className="mt-8 flex space-x-4">
            <Link
                href="/archive"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                data-testid="archive-link"
            >
                View Past Fun Facts
            </Link>
        </div>
    )
}

export default Navigation
