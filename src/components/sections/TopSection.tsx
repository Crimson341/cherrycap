import React from 'react'
import { FlickeringGrid } from '../ui/FlickingGridBG'
import PixelTypingDemo from '../PixelTypingAnimation'

function TopSection() {
  return (
      <div className="relative full-line-bottom">
        <div className="aspect-2/1 relative select-none  md:aspect-3/1 border-x">
          <FlickeringGrid
            className="relative inset-0 z-0 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
            squareSize={4}
            gridGap={6}
            color="#999"
            maxOpacity={0.5}
            flickerChance={0.1}
            height={800}
            width={800}
          />
          <PixelTypingDemo />
        </div>
      </div>
  )
}

export default TopSection