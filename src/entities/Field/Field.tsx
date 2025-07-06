
import styles from './styles.module.css';

interface FieldProps {
  fieldKey: string;
  field: {
    type: string;
    placeholder?: string;
    required?: boolean;
  };
  value: string;
  error: string;
  isVisibleError: boolean;
  serverError: string | undefined;
  onChange: (key: string, value: string) => void;
  onFocus: (key: string) => void;
  onBlur: (key: string) => void;
  hiddenError: (key: string) => void;
}

export default function Field({ fieldKey, field, value, error, isVisibleError, serverError, onChange, onFocus, onBlur, hiddenError }: FieldProps) {
  return (
    <div className={styles.fieldWrapper}>
      {field.type === 'textarea' ? (
        <textarea
          name={fieldKey}
          className={`${styles.textarea} ${(error || serverError) ? styles.inputError : ''}`}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          onFocus={() => onFocus(fieldKey)}
          onBlur={() => onBlur(fieldKey)}
        />
      ) : (
        <input
          name={fieldKey}
          type={field.type === 'name' ? 'text' : field.type}
          className={`${styles.input} ${(error || serverError) ? styles.inputError : ''}`}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          onFocus={() => onFocus(fieldKey)}
          onBlur={() => onBlur(fieldKey)}
        />
      )}
      <p 
        onPointerDown={() => hiddenError(fieldKey)}
        className={`${styles.error} ${(isVisibleError && (error || serverError)) ? styles.visible : ''}`}
      >
        {error || serverError}
      </p>
    </div>
  );
}