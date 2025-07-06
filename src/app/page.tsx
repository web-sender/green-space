import Preview from '@/widgets--section/Preview/Preview'
import About from '@/widgets--section/About/About'
import SectionSteps from '@/widgets--section/SectionSteps/SectionSteps'
import Contact from '@/widgets--section/Contact/Contact'
import styles from "./styles/page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Preview />
        <About />
        <SectionSteps />
        <Contact />
      </main>
    </div>
  );
}
