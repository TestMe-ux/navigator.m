import * as React from "react"

export interface ScreenSize {
  width: number
  isSmall: boolean      // 1352px - 1500px
  isMedium: boolean    // 1501px - 1800px  
  isLarge: boolean     // above 1800px
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = React.useState<ScreenSize>({
    width: 0,
    isSmall: false,
    isMedium: false,
    isLarge: false,
  })

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      setScreenSize({
        width,
        isSmall: width >= 1352 && width <= 1500,
        isMedium: width >= 1501 && width <= 1800,
        isLarge: width > 1800,
      })
    }

    // Set initial value
    updateScreenSize()

    // Add event listener
    window.addEventListener('resize', updateScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}
