'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Users, FileText, Clock, MapPin, Lightbulb } from 'lucide-react'
import { EnhancedAIAnalysis, AnalysisSection, W5Analysis } from '@/lib/services/ai'

interface EnhancedAnalysisProps {
  analysis: EnhancedAIAnalysis
  defaultExpanded?: boolean
}

export function EnhancedAnalysisDisplay({ analysis, defaultExpanded = false }: EnhancedAnalysisProps) {
  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      {/* Executive Summary */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          Analysis Summary
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          {analysis.executiveSummary}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {analysis.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            📊 Confidence: {Math.round(analysis.confidenceScore * 100)}%
          </span>
        </div>
      </div>

      {/* Five Key Sections */}
      <div className="space-y-4">
        <AnalysisSectionCard
          title="✓ What's True"
          icon="✓"
          section={analysis.whatIsTrue}
          defaultExpanded={defaultExpanded}
          color="green"
        />

        <AnalysisSectionCard
          title="⚠ What's Spin"
          icon="⚠"
          section={analysis.whatIsSpin}
          defaultExpanded={defaultExpanded}
          color="yellow"
        />

        <AnalysisSectionCard
          title="👥 Real Impact"
          icon="👥"
          section={analysis.realImpact}
          defaultExpanded={defaultExpanded}
          color="blue"
        />

        <AnalysisSectionCard
          title="🤝 Common Ground"
          icon="🤝"
          section={analysis.commonGround}
          defaultExpanded={defaultExpanded}
          color="purple"
        />

        <AnalysisSectionCard
          title="💡 The Bigger Picture"
          icon="💡"
          section={analysis.biggerPicture}
          defaultExpanded={defaultExpanded}
          color="indigo"
        />
      </div>
    </div>
  )
}

interface AnalysisSectionCardProps {
  title: string
  icon: string
  section: AnalysisSection
  defaultExpanded?: boolean
  color: 'green' | 'yellow' | 'blue' | 'purple' | 'indigo'
}

function AnalysisSectionCard({
  title,
  icon,
  section,
  defaultExpanded = false,
  color
}: AnalysisSectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const colorClasses = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      button: 'text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40',
      icon: 'text-green-600 dark:text-green-400'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      button: 'text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
      icon: 'text-yellow-600 dark:text-yellow-400'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      button: 'text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      button: 'text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      button: 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
      icon: 'text-indigo-600 dark:text-indigo-400'
    }
  }

  const colors = colorClasses[color]
  const hasW5 = section.w5Details !== undefined

  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg} overflow-hidden`}>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
          <span className={colors.icon}>{icon}</span>
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {section.summary}
        </p>

        {/* W5 Expandable Section */}
        {hasW5 && (
          <div className="mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${colors.button}`}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {isExpanded ? 'Hide' : 'Dig Deeper with'} W5 Analysis
              </span>
            </button>

            {isExpanded && section.w5Details && (
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                <W5DetailItem
                  icon={<Users className="w-5 h-5" />}
                  label="Who"
                  content={section.w5Details.who}
                />
                <W5DetailItem
                  icon={<FileText className="w-5 h-5" />}
                  label="What"
                  content={section.w5Details.what}
                />
                <W5DetailItem
                  icon={<Clock className="w-5 h-5" />}
                  label="When"
                  content={section.w5Details.when}
                />
                <W5DetailItem
                  icon={<MapPin className="w-5 h-5" />}
                  label="Where"
                  content={section.w5Details.where}
                />
                <W5DetailItem
                  icon={<Lightbulb className="w-5 h-5" />}
                  label="Why"
                  content={section.w5Details.why}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface W5DetailItemProps {
  icon: React.ReactNode
  label: string
  content: string
}

function W5DetailItem({ icon, label, content }: W5DetailItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 text-gray-600 dark:text-gray-400 mt-1">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
          {label}
        </h4>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  )
}

// Settings toggle component for user preferences
export function W5AnalysisToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('w5Analysis') !== 'false'
    }
    return true
  })

  const handleToggle = () => {
    const newValue = !enabled
    setEnabled(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem('w5Analysis', String(newValue))
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Deep-Dive W5 Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Get detailed Who, What, When, Where, Why breakdowns for each analysis section
        </p>
      </div>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
