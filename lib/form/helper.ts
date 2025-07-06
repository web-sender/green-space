import { z } from 'zod';

// Определение Zod-схем для разных типов полей
export const fieldSchemas: { [key: string]: z.ZodTypeAny } = {
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .regex(/^[a-zA-Zа-яА-Я\s-]+$/, 'Имя может содержать только буквы, пробелы или дефисы'),
  email: z.string().email('Введите корректный email'),
  tel: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, 'Введите корректный номер телефона'),
  textarea: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
  text: z.string().min(1, 'Поле не может быть пустым'),
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
    text: string;
    imgUrl: string;
  };
  button: {
    text: string;
    agreeText: string;
  };
}

// Создание динамической схемы на основе полей
export const createFormSchema = (fields: PropsForm['fields']) => {
  const schemaShape: { [key: string]: z.ZodTypeAny } = {};
  Object.keys(fields).forEach((key) => {
    const fieldType = fields[key].type;
    const schema = fieldSchemas[fieldType] || fieldSchemas.text;
    schemaShape[key] = fields[key].required ? schema : schema.optional();
  });
  return z.object(schemaShape);
};