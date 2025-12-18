import Link from 'next/link'

interface NavigationCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  bgColor?: string
}

export default function NavigationCard({
  title,
  description,
  href,
  icon,
  bgColor = 'bg-white'
}: NavigationCardProps) {
  return (
    <Link
      href={href}
      className={`block p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${bgColor} border border-gray-100`}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      <div className="mt-4 text-blue-600 font-medium flex items-center group">
        进入页面
        <svg
          className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}