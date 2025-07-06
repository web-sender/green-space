'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import MainLogo from '@/shared--layout/MainLogo/MainLogo'
import MenuButton from '@/shared--layout/MenuButton/MenuButton'
import ListSocial from '@/features/ListSocial/ListSocial'
import { useFullscreenStatus } from '@/hooks/useFullscreenStatus'
import { preciseTimeout } from '@/helpers/timeHelper'
import layoutData from '@/data/layoutData.json'
import contactData from '@/data/contactData.json'
import styles from './styles/header.module.css'


/* 
	Реализует строку даты в удобно-четаемом формате
*/
function Calendar() {
	const [date, setDate] = useState('')

	useEffect(() => {
		const date = new Date()
		const dateISO = (date.toISOString()).split('T')[0]
		const dateISOParts = dateISO.split('-')
		dateISOParts[1] = layoutData.months[Number(dateISOParts[1]) - 1].ru
		const prettyDate = dateISOParts.reverse().join(', ')

		setDate(prettyDate)
	}, [])

	return (
		<div className={styles.date}>
			{date}
		</div>
	)
}


interface INavItem {
	url: string
	name: string
}
interface NavListProps {
	navList: INavItem[]
}
function NavList({ navList }: NavListProps) {

	return (
		<nav className={styles.navList}>
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
		</nav>
	)
}


/* 
	Создан аналог NavList для адаптации стилей под меню с разделением на NavItem и NavListMenu.
	Использует те же css классы, только с добавлением inMenu к navList.
*/
interface NavItemProps {
	navItem: INavItem
	key: string | number
}
function NavItem({ navItem }: NavItemProps) {

	return (<li className={`${styles.navItem}`}>
		<Link
			href={navItem.url}
			className={styles.navItemLink}
		>
			{navItem.name}
		</Link>
	</li>)
}
interface NavListMenuProps {
	navList: INavItem[]
}
function NavListMenu({ navList }: NavListMenuProps) {

	return (
		<nav className={`${styles.navList} ${styles.inMenu}`}>
			<ul className={styles.navListContainer}>
				{navList.map((navItem, index) => (
					<NavItem navItem={navItem} key={index} />
				))}
			</ul>
		</nav>
	)
}


interface MenuProps {
	isOpen: boolean;
	navList: INavItem[]
	toggle: () => void
}
function Menu({ isOpen, navList, toggle }: MenuProps) {
	const firstHidden = useRef(false)

	// Предотвращает нежелательную анимацию Menu при загрузке страницы
	useEffect(() => {
		if (isOpen) { firstHidden.current = true }
	}, [isOpen])

	return (<div className={`${styles.menu} ${firstHidden.current ? styles.animBack : ''} ${isOpen ? styles.active : ''}`}>
		<div className={styles.menuContainer}>
			<div className={styles.menuHeader}>
				<Link href='/' onClick={toggle}>
					<MainLogo />
				</Link>
				<Calendar />
			</div>
			<NavListMenu navList={navList} />
			<ListSocial items={contactData.social} />
		</div>
	</div>)
}

interface IBlocked {
	time: number
	blocked: boolean
}
function Header() {
	const blurRef = useRef<HTMLDivElement | null>(null)
	// Состояния контроля порядком анимации между Header и Menu
	const [isOpen, setIsOpen] = useState(false)
	const [visibleMenu, setVisibleMenu] = useState(false)
	const [isHidden, setIsHidden] = useState(false)
	
	const isBlocked = useRef<IBlocked>({
		time: 0, blocked: false
	})
	const { isFullscreen, transition } = useFullscreenStatus()
	
	const [disabled, setDisabled] = useState(false)
	const [isScrolledTo, setIsScrolledTo] = useState(false);
	
	useEffect(() => {
	  if (isFullscreen && transition === 'enter') {
	  	isBlocked.current.time = Date.now()
	  	isBlocked.current.blocked = true
	  }
	}, [isFullscreen, transition])
	

	// Скрываем header на условной граници начала footer (оставляя меню видимым)
	useEffect(() => {
		// Используется заранее предпологаемый расчёт для скрытия
		const handleScroll = () => {
			const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
			const scrollPosition = window.scrollY;
			const scrollPercentage = (scrollPosition / totalHeight) * 100;

			setIsScrolledTo(scrollPercentage >= 94);
		}

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [])

	// Устанавливаем размеры Menu при закрытии равным кнопки
	useEffect(() => {
		// Создаём временный элемент для расчёта размеров 
		const updateScale = () => {
			const tempElement = document.createElement('div');
			document.body.appendChild(tempElement);
			tempElement.style.position = 'absolute'
			tempElement.style.bottom = '10000%'
			tempElement.style.zIndex = '-100'
			// Применяем CSS-переменные к временному элементу необходимые для расчёта
			tempElement.style.width = 'var(--menu-width)';
			tempElement.style.height = 'var(--menu-height)';
			tempElement.style.fontSize = 'var(--size-btn-menu)'; // Используем fontSize для rem/calc из этой переменной

			// Получаем вычисленные значения в пикселях
			const styles = getComputedStyle(tempElement);
			const menuWidth = parseFloat(styles.width); // Например, 700px
			const menuHeight = parseFloat(styles.height); // Например, 700px
			const sizeBtnMenu = parseFloat(styles.fontSize); // Например, 40px

			// Проверяем на NaN и деление на ноль
			if (!isNaN(menuWidth) && !isNaN(sizeBtnMenu) && menuWidth !== 0) {
				const scaleValueX = (sizeBtnMenu * 1.40 / menuWidth);
				const scaleValueY = (sizeBtnMenu * 1.40 / menuHeight);

				// Обновляем --scale-x в :root
				document.documentElement.style.setProperty('--scale-x', scaleValueX.toString());
				document.documentElement.style.setProperty('--scale-y', scaleValueY.toString());
			} else {
				// Устанавливаем значение по умолчанию, если расчёт невозможен
				document.documentElement.style.setProperty('--scale-x', '.2');
				document.documentElement.style.setProperty('--scale-y', '.15');
			}

			if (document.body.contains(tempElement)) {
				document.body.removeChild(tempElement);
			}
		};

		updateScale();
		window.addEventListener('resize', updateScale)

		// Очищаем временный элемент и слушатель при размонтировании
		return () => {
			window.removeEventListener('resize', updateScale)
		};
	}, []);

	// Предотвращение прокрутки при открытом меню
	useEffect(() => {
		const preventScroll = (e: Event) => {
			if (visibleMenu) {
				e.preventDefault();
			}
		};

		const current = blurRef.current; // Сохраняем current в переменную для удобства
		if (current) {
			current.addEventListener('touchmove', preventScroll, { passive: false });
			current.addEventListener('wheel', preventScroll, { passive: false });
		}

		return () => {
			if (current) {
				current.removeEventListener('touchmove', preventScroll);
				current.removeEventListener('wheel', preventScroll);
			}
		};
	}, [visibleMenu]);

	// Функция открытия меню с контролем порядка анимации между Header и Menu
	const toggle = () => {
		// Предотвращаем самопроизвольное открытие меню после выхода из полноэкранного режима
		if (isBlocked.current.blocked) {
			if ((Date.now() - isBlocked.current.time) <= 2500) {
				isBlocked.current = { time: 0, blocked: false }; 
				return;
			}
			isBlocked.current = { time: 0, blocked: false }; 
		}
		function sendDelay(delay: string) {
			document.documentElement.style.setProperty('--menu-delay', delay || '.9s');
		}
		setDisabled(true)
		setIsOpen(!isOpen)

		if (isOpen) {
			setVisibleMenu(!isOpen)
			setIsHidden(!isOpen)
		} else {
			setIsHidden(!isOpen)

			if (isScrolledTo) { // Убераем задержку открытия меню если Header уже скрыт (условная граници начала footer)
				sendDelay('0s')
				setVisibleMenu(!isOpen)
			} else {
				sendDelay('.9s')
				setVisibleMenu(!isOpen)
			}
		}
		preciseTimeout(() => {
			setDisabled(false)
		}, isScrolledTo ? 1600 : 2300)
	}

	return (<>
		<header className={`${styles.header} ${(isHidden || isScrolledTo) ? styles.hidden : ''}`}>
			<div className={styles.headerContainer}>
				<div className={styles.headerContent}>
					<MainLogo />
					<div className={styles.navWrap}>
						<NavList navList={layoutData.navList} />
					</div>
				</div>

				<div className={styles.desktopContent}>
					<Calendar />
				</div>

			</div>
			<div className={styles.menuWrapper}>
				<Menu navList={layoutData.navList} isOpen={visibleMenu} toggle={toggle} />
				<MenuButton isOpen={isOpen} toggle={toggle} disabled={disabled} />
			</div>
		</header>
		<div ref={blurRef} className={`${styles.blurBackground} ${visibleMenu ? styles.active : ''}`}></div>
	</>)
}

export default Header;