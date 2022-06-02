import { useEffect } from "react"
import Image from 'next/image'

const ColorSwith = (): JSX.Element => {

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
  }
  const handleLightTheme = () => {
    handleClearTheme()
    document.documentElement.classList.add('light')
    localStorage.setItem('color-theme', 'light')
  }

  return (
    <div className="flex  bg-light-bg dark:bg-dark-bg rounded-md transition-colors">
      <div
        className="items-center justify-center cursor-pointer rounded-lg shadow px-3 h-9 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 flex dark:hidden transition-all"
        onClick={handleDarkTheme}
      >
        <Image src="/sun.svg" alt="sun" width={25} height={24} />
      </div>
      <div
        className="items-center justify-center cursor-pointer rounded-lg shadow px-3 h-9 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hidden dark:flex transition-all"
        onClick={handleLightTheme}
      >
        <Image src="/moon.svg" alt="moon" width={25} height={24} />
      </div>
    </div>
  )
}

export default ColorSwith