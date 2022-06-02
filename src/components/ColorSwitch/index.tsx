import { useState, useEffect } from "react"
import Image from 'next/image'

const ColorSwith = (): JSX.Element => {

  const [isDark, setDark] = useState(false);

  useEffect(() => {
    if (
      localStorage.getItem('color-theme') === 'dark' ||
      (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      handleDarkTheme()
    } else {
      handleLightTheme()
    }
  }, [])

  const handleClearTheme = () => {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.remove('light')
  }

  const handleDarkTheme = () => {
    handleClearTheme()
    document.documentElement.classList.add('dark')
    localStorage.setItem('color-theme', 'dark')
    setDark(true)
  }

  const handleLightTheme = () => {
    handleClearTheme()
    document.documentElement.classList.add('light')
    localStorage.setItem('color-theme', 'light')
    setDark(false)
  }

  return (
    <div className="flex bg-light-bg dark:bg-dark-bg rounded-md transition-colors">
      <div className="items-center justify-center cursor-pointer rounded-lg shadow-md px-3 h-9 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 flex transition-all" onClick={!isDark ? handleDarkTheme : handleLightTheme}>
        <Image src={`/${!isDark ? 'sun' : 'moon'}.svg`} alt="sun" width={25} height={24} />
      </div>
    </div>
  )
}

export default ColorSwith