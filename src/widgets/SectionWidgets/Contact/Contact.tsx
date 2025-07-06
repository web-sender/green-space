import contactData from '@/data/contactData.json';
import Form from '@/features/Form/Form';
import ListSocial from '@/features/ListSocial/ListSocial';
import styles from './styles.module.css';

export default function Contact() {

  return (
    <section id='contact' className={styles.section}>
      <div className={styles.contentContainer}>
        <div className={styles.content}>
          <div>
            <h2>{contactData.title}</h2>
          </div>
          <div className={styles.previewDescription}>
            <p className='description'>{contactData.description}</p>
          </div>
        </div>
        <Form 
          fields={contactData.form.fields} 
          agreeField={contactData.form.agreeField} 
          button={contactData.form.button}
        />
        <ListSocial items={contactData.social}/>
      </div>
    </section>
  );
}