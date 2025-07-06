import Image from 'next/image'
import Link from 'next/link';
import styles from './styles.module.css';

interface ISocialItems {
  imgUrl: string
  linkUrl: string
  altText: string
}

interface ListSocialProps {
  items: ISocialItems[]
}

export default function ListSocial({items}: ListSocialProps) {
  return (
    <div className={styles.listSocial}>
      {items.map((item, index) => (
        <Link className={`${styles.socialItem} imgContainer`}
            href={item.linkUrl} key={index}
        >
          <Image className='img' 
            src={item.imgUrl} 
            fill={true} alt={item.altText}
          />
        </Link>
      ))}
    </div>
  )
}