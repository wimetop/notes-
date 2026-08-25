import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email('Введіть коректний email.'),
  password: z.string().min(8, 'Пароль має містити щонайменше 8 символів.'),
});

const authFormSchema = credentialsSchema.extend({
  name: z.string().trim().optional(),
});

export type AuthFormInput = z.infer<typeof authFormSchema>;

export function createAuthFormSchema(requireName: boolean) {
  return authFormSchema.superRefine((value, context) => {
    if (requireName && !value.name) {
      context.addIssue({ code: 'custom', message: 'Вкажіть ім’я.', path: ['name'] });
    }
  });
}
