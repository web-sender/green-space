import previewData from '@/data/previewData.json';
import Card from '@/features/PreviewCard/PreviewCard';
import styles from './styles.module.css';

export default function Preview() {

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <div>
          <h1>{previewData.title}</h1>
        </div>
        <div className={styles.descriptionWrap}>
          <p className={`${styles.description} description`}>{previewData.description}</p>
        </div>
      </div>
      <Card img={previewData.card.img} link={previewData.card.link}/>
    </section>
  );
}