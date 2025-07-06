import VideoCube from '@/widgets--self/VideoCube/VideoCube';
import StatsList from './children/StatsList';
import aboutData from '@/data/aboutData.json';
import styles from './styles.module.css';

export default function About() {

  return (
    <section className={styles.section}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionPart}>
          <div className={styles.sectionTitle}>
            <h2>{aboutData.title}</h2>
          </div>
          <div className={styles.sectionDescription}>
            <p className='description'>{aboutData.description}</p>
          </div>
        </div>
        
        <div className={styles.sectionPart}>
          <div className={styles.videoWrap}>
            <VideoCube videoList={aboutData.videoList} />
          </div>
          <div className={styles.featuresWrap}>
            <StatsList stats={aboutData.stats} />
          </div>
        </div>
      </div>
    </section>
  );
}