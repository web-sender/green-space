import StepList from '@/features/StepList/StepList';
import styles from './styles.module.css';
import sectionData from '@/data/sectionContent.json';

export default function SectionSteps() {
  
  return (
    <section id='why_us' className={styles.section}>
      <div className={styles.titleWrap}>
        <h2>{sectionData.title}</h2>
      </div>
      <StepList steps={sectionData.steps}/>
    </section>
  );
}