import Image from 'next/image'
import layoutData from '@/data/layoutData.json';

interface MainLogoProps {
	width?: number
}
function MainLogo({ width }: MainLogoProps) {
  return (
    <div className='imgContainer mainLogo'
      style={{ width: `${width || 70}px` }}
    >
      <Image className='img' src={layoutData.mainLogo.imgUrl} 
        fill={true} alt={layoutData.mainLogo.altText}
      />
    </div>
  )
}

export default MainLogo;