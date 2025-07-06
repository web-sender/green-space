'use server'
import { createFormSchema } from './helper'

// Серверный action для обработки формы
export async function submitForm(formData: FormData) {
  const data: { [key: string]: string } = {};
  formData.forEach((value, key) => {
    if (key !== 'agree') {
      data[key] = value as string;
    }
  });

  // Создание схемы для валидации
  const fields = Object.fromEntries(
    Array.from(formData.entries())
      .filter(([key]) => key !== 'agree')
      .map(([key]) => [key, { type: key, required: true }])
  );
  const schema = createFormSchema(fields);

  // Валидация на сервере
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: { [key: string]: string } = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      errors[path] = issue.message;
    });
    return { success: false, errors };
  }

  // Здесь можно добавить логику сохранения данных, например, в базу данных
  console.log('Данные формы:', result.data);

  return { success: true, data: result.data };
}
