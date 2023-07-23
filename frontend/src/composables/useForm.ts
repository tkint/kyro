import { ComputedRef, UnwrapNestedRefs, computed, reactive } from 'vue';
import { z } from 'zod';

type ValidationResult = string | true;
type ValidationRule = (value: any) => ValidationResult;

type InferShape<TObj extends object> = {
  [TKey in keyof TObj]-?: undefined extends TObj[TKey] ? z.ZodOptional<z.ZodType<TObj[TKey]>> : z.ZodType<TObj[TKey]>;
};

type UseFormReturn<TObj extends object, TSchema = any> = {
  schema: TSchema;
  input: UnwrapNestedRefs<Partial<TObj>>;
  rulesFor: <TField extends keyof TObj>(field: TField) => ValidationRule[];
  validate: () => z.SafeParseReturnType<Partial<TObj>, TObj>;
  isValid: ComputedRef<boolean>;
};

export const useForm = <TObj extends object>(
  shape: InferShape<TObj>,
  initialValue?: Partial<TObj>,
): UseFormReturn<TObj, typeof schema> => {
  const schema = z.object(shape);
  const input = reactive<Partial<TObj>>(initialValue ?? {});

  const validate = () => schema.safeParse(input) as z.SafeParseReturnType<Partial<TObj>, TObj>;

  return {
    schema,
    input,
    rulesFor: (field) => {
      const fieldSpec = shape[field as keyof typeof shape];
      return [
        (value) => {
          const result = fieldSpec.safeParse(value);
          if (result.success) return true;
          return result.error.format()._errors.toString();
        },
      ];
    },
    validate,
    isValid: computed(() => validate().success),
  };
};
