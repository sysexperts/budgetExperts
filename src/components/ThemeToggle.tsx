import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Palette, Sparkles } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      case 'blue':
        return <Palette className="h-5 w-5" />
      case 'green':
        return <Sparkles className="h-5 w-5" />
      case 'purple':
        return <Palette className="h-5 w-5" />
      default:
        return <Sun className="h-5 w-5" />
    }
  }

  const getThemeColor = () => {
    switch (theme) {
      case 'light':
        return 'text-yellow-500'
      case 'dark':
        return 'text-blue-300'
      case 'blue':
        return 'text-blue-500'
      case 'green':
        return 'text-green-500'
      case 'purple':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${getThemeColor()}`}
      title={`Aktuelles Theme: ${theme}. Klicken zum Wechseln.`}
    >
      {getThemeIcon()}
    </button>
  )
}
