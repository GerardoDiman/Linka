import React from 'react'

interface LogoProps {
  className?: string
  showWordmark?: boolean
}

const Logo: React.FC<LogoProps> = ({ className = 'h-8', showWordmark = true }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/brand/linka_logo.svg" alt="Linka" className="h-full w-auto" />
      {showWordmark && (
        <span className="ml-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Linka</span>
      )}
    </div>
  )
}

export default Logo


