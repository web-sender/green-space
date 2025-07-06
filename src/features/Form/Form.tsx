'use client'
import { useState } from 'react';
import { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { fieldSchemas, createFormSchema } from '@/lib/form/helper'
import Image from 'next/image'
import Field from '@/entities/Field/Field'
import styles from './styles.module.css';
// import { submitForm } from '@/lib/form/action'

interface IFieldState {
	[key: string]: { 
		value: string
		error: string
		isVisibleError: boolean 
	}
}
const resetErrorVisibility = ( fieldData: IFieldState ): IFieldState => {
  const updatedData = { ...fieldData };
  Object.keys(updatedData).forEach((key) => {
    updatedData[key] = { ...updatedData[key], isVisibleError: false };
  });
  return updatedData;
};

interface PropsForm {
  fields: {
    [key: string]: {
      type: string;
      placeholder?: string;
      required?: boolean;
    };
  };
  agreeField: {
    text: string
    imgUrl: string
  };
  button: {
    text: string
    agreeText: string
  }
}
export default function Form({ fields, agreeField, button }: PropsForm) {
  const router = useRouter();
  const [fieldData, setFieldData] = useState(() => {
    const initialData: IFieldState = {};
    Object.keys(fields).forEach((key) => {
      initialData[key] = { value: '', error: '', isVisibleError: false };
    });
    return initialData;
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [isBadReq, setIsBadReq] = useState(false)
  const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>({});

  // Создание схемы для клиентской валидации
  const formSchema = createFormSchema(fields);

  // Обработчик изменения поля
  const handleChange = (key: string, value: string) => {
    const fieldType = fields[key].type;
    const schema = (fieldSchemas[fieldType] || fieldSchemas.text).optional();
    const result = schema.safeParse(value);

    setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
        error: fields[key].required && !result.success ? result.error.issues[0].message : '',
        isVisibleError: prev[key].isVisibleError, // Сохраняем текущее состояние видимости
      },
    }));
    setServerErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleFocus = () => {
    setFieldData( resetErrorVisibility( fieldData ) );
  };

  const handleBlur = (key: string) => {
    setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isVisibleError: Boolean(serverErrors[key]) || Boolean(prev[key].error),
      },
    }));
  };
  
  const handleHidden = (key: string) => {
  	setFieldData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isVisibleError: false,
      },
    }));
  }
  
  const onAgree = (e: ChangeEvent<HTMLInputElement>) => {
  	setIsAgreed(e.target.checked)
  	if (e.target.checked) {
  		setIsBadReq(false)
  	}
  }
  const handleCheck = () => {
  	if (!isAgreed) {
  		setIsBadReq(true)
  	} else {
  		setIsBadReq(false)
  	}
  }

  const handleSubmit = async (formData: FormData) => {
    const data: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      if (key !== 'agree') {
        data[key] = value as string;
      }
    });

    const result = formSchema.safeParse(data);
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldData((prev) => {
        const newData = { ...prev };
        Object.keys(fields).forEach((key) => {
          newData[key] = {
            ...newData[key],
            error: errors[key] || '',
            isVisibleError: true, // Показываем ошибки после попытки отправки
          };
        });
        return newData;
      });
      return;
    }

    /*
    const response = await submitForm(formData);

    if (!response.success) {
      setServerErrors(response.errors || {});
      return;
    }
    console.log('Форма успешно отправлена:', response.data);
    */

    router.push('/success');
  };
  
  return (
    <div className={styles.formContainer}>
      <form className={styles.form} action={handleSubmit}>
        <div className={styles.fieldContainer}>
          {Object.keys(fields).map((key, index) => (
            <Field 
              key={index}
              fieldKey={key}
              field={fields[key]}
              value={fieldData[key].value}
              error={fieldData[key].error}
              isVisibleError={fieldData[key].isVisibleError}
              serverError={serverErrors[key]}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              hiddenError={handleHidden}
            />
          ))}
        </div>
        <div className={styles.agreeField}>
          <label className={`${styles.checkboxContainer} ${isBadReq ? styles.badReq : ''}`}>
            <input className={styles.checkboxOriginal}
              type='checkbox'
              name="agree"
              checked={isAgreed}
              onChange={onAgree}
            />
            <div className={styles.checkbox}>
              { isAgreed ? (
                  <Image src={agreeField.imgUrl} 
                    fill={true} alt='check'/>
                ) 
              : null }
            </div>
          </label>
          <p className={styles.agreeText}>
            {agreeField.text}
          </p>
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!isAgreed}
          onPointerDown={handleCheck}
        >
          {button.text}
        </button>
      </form>
    </div>
  );
}