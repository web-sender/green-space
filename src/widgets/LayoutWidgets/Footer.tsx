'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import MainLogo from '@/shared--layout/MainLogo/MainLogo'
import layoutData from '@/data/layoutData.json';
import styles from './styles/footer.module.css'

interface INavItem {
  url: string
  name: string
}
interface NavLinkProps {
  navList: INavItem[]
}
function NavLink({navList}: NavLinkProps) {
  return (<nav className={styles.navList}>
    <ul className={styles.navListContainer}>
      {navList.map((navItem, index) => (
        <li className={styles.navItem} key={index}>
          <Link
            href={navItem.url}
            className={styles.navItemLink}
          >
            {navItem.name}
          </Link>
        </li>
      ))}
    </ul>
  </nav>)
}

function Footer() {
	const pathname = usePathname()

  return ( layoutData.allowedPathList.includes(pathname) ?
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <MainLogo />
        <NavLink navList={layoutData.navList}/>
        <p>Green&Space с 2025</p>
      </div>
    </footer>
  : null)
}

export default Footer;