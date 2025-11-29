import { Metadata } from 'next'
import Link from 'next/link'
import { DatabaseService } from '@/lib/db'
import { ArticleCard } from '@/components/features/article-card'

export const metadata: Metadata = {
    title: 'Archives - Narrative News',
    description: 'Browse historical news analysis and verify the truth chain.',
}

export default async function ArchivesPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1
    const limit = 12
    const offset = (page - 1) * limit
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
    const date = typeof searchParams.date === 'string' ? searchParams.date : undefined

    // In a real implementation, we would pass 'search' and 'date' to getArticles
    // For now, we just fetch the latest
    const articles = await DatabaseService.getArticles({
        limit,
        offset,
        published: true
    })

    return (
        <div className="min-h-screen bg-paper pb-20">
            {/* Header */}
            <div className="bg-navy-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gold-500">
                        The Archives
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
                        Explore the history of media narratives. Every story is cryptographically hashed and anchored to the Truth Chain for permanent verification.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-sm shadow-card p-6 mb-12">
                    <form className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="sr-only">Search</label>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Search headlines, topics, or analysis..."
                                defaultValue={search}
                                className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:border-navy-900 focus:ring-1 focus:ring-navy-900 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="sr-only">Date</label>
                            <input
                                type="date"
                                name="date"
                                id="date"
                                defaultValue={date}
                                className="w-full px-4 py-3 rounded-sm border border-gray-200 focus:border-navy-900 focus:ring-1 focus:ring-navy-900 outline-none transition-colors text-gray-600"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full h-full bg-navy-900 text-white font-bold uppercase tracking-wide text-sm px-6 py-3 rounded-sm hover:bg-navy-800 transition-colors"
                            >
                                Search Archives
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Grid */}
                <div className="grid gap-8">
                    {articles.length > 0 ? (
                        articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-navy-900 mb-2">No stories found</h3>
                            <p className="text-gray-500">Try adjusting your search or date range.</p>
                        </div>
                    )}
                </div>

                {/* Pagination (Mock) */}
                {articles.length > 0 && (
                    <div className="mt-12 flex justify-center space-x-2">
                        <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-sm hover:border-navy-900 hover:text-navy-900 transition-colors disabled:opacity-50" disabled={page === 1}>
                            Previous
                        </button>
                        <button className="px-4 py-2 bg-navy-900 text-white rounded-sm">
                            1
                        </button>
                        <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-sm hover:border-navy-900 hover:text-navy-900 transition-colors">
                            2
                        </button>
                        <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-sm hover:border-navy-900 hover:text-navy-900 transition-colors">
                            3
                        </button>
                        <span className="px-4 py-2 text-gray-400">...</span>
                        <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded-sm hover:border-navy-900 hover:text-navy-900 transition-colors">
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
