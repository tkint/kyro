import { computed, reactive } from "vue";
import { z } from "zod";

type ValidationResult = string | true;
type ValidationRule = (value: any) => ValidationResult;

type TypedZodRawShape<TObject> = Record<
  keyof TObject,
  z.ZodType<TObject[keyof TObject]>
>;

export const useForm = <TObject extends object>(
  shape: TypedZodRawShape<TObject>,
  initialValue: TObject
) => useInferedForm(shape, initialValue);

export const useInferedForm = <
  TShape extends z.ZodRawShape,
  TObject extends z.infer<typeof schema>
>(
  shape: TShape,
  initialValue: TObject
) => {
  const schema = z.object<TShape>(shape);
  const input = reactive(initialValue);

  const validate = () => schema.safeParse(input);

  return {
    schema,
    input,
    rulesFor: <TField extends keyof TShape>(
      field: TField
    ): ValidationRule[] => {
      const fieldSpec = shape[field];
      return [
        (value) => {
          const result = fieldSpec.safeParse(value);
          if (result.success) return true;
          return result.error.format()._errors.toString();
        },
      ];
    },
    validate: () => schema.safeParse(input),
    isValid: computed(() => validate().success),
  };
};
