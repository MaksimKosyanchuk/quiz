'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Control, useFieldArray, useForm, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { quizApi } from '@/services/api';
import type { CreateQuizPayload, QuestionType } from '@/types/quiz';
import Button from './Button';
import Select, { SelectOption } from './Select';
import styles from './QuizForm.module.scss';

const optionSchema = z.object({
    text: z.string().trim().min(1, 'Option text is required'),
    isCorrect: z.boolean(),
});

const questionSchema = z
    .object({
        type: z.enum(['BOOLEAN', 'INPUT', 'CHECKBOX']),
        text: z.string().trim().min(1, 'Question text is required'),
        booleanAnswer: z.boolean(),
        textAnswer: z.string(),
        options: z.array(optionSchema),
    })
    .superRefine((q, ctx) => {
        if (q.type === 'INPUT' && !q.textAnswer.trim()) {
            ctx.addIssue({ code: 'custom', path: ['textAnswer'], message: 'Answer is required' });
        }
        if (q.type === 'CHECKBOX') {
            if (q.options.length < 2) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['options'],
                    message: 'Add at least 2 options',
                });
            }
            if (!q.options.some((o) => o.isCorrect)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['options'],
                    message: 'Mark at least one correct option',
                });
            }
        }
    });

const quizSchema = z.object({
    title: z.string().trim().min(1, 'Title is required'),
    questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

type FormValues = z.infer<typeof quizSchema>;
type QuestionValues = FormValues['questions'][number];

const QUESTION_TYPES: SelectOption<QuestionType>[] = [
    { value: 'BOOLEAN', label: 'Boolean (True / False)' },
    { value: 'INPUT', label: 'Input (short text)' },
    { value: 'CHECKBOX', label: 'Checkbox (multiple correct)' },
];

const emptyQuestion = (): QuestionValues => ({
    type: 'BOOLEAN',
    text: '',
    booleanAnswer: true,
    textAnswer: '',
    options: [],
});

const defaultOptions = () => [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
];

function toPayload(values: FormValues): CreateQuizPayload {
    return {
        title: values.title.trim(),
        questions: values.questions.map((q) => {
            const base = { type: q.type, text: q.text.trim() };
            if (q.type === 'BOOLEAN') return { ...base, booleanAnswer: q.booleanAnswer };
            if (q.type === 'INPUT') return { ...base, textAnswer: q.textAnswer.trim() };
            return {
                ...base,
                options: q.options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
            };
        }),
    };
}

function CheckboxOptions({
    index,
    control,
    register,
    error,
}: {
    index: number;
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    error?: string;
}) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `questions.${index}.options`,
    });

    return (
        <div className={styles.question}>
            {fields.map((field, i) => (
                <div key={field.id} className={styles.option}>
                    <input
                        type="checkbox"
                        aria-label="Correct option"
                        {...register(`questions.${index}.options.${i}.isCorrect`)}
                    />
                    <input
                        type="text"
                        className="input"
                        placeholder={`Option ${i + 1}`}
                        {...register(`questions.${index}.options.${i}.text`)}
                    />
                    <button
                        type="button"
                        className="btn btn--danger"
                        aria-label="Remove option"
                        disabled={fields.length <= 2}
                        onClick={() => remove(i)}
                    >
                        ✕
                    </button>
                </div>
            ))}
            {error && <p className="error">{error}</p>}
            <div>
                <button
                    type="button"
                    className="btn"
                    onClick={() => append({ text: '', isCorrect: false })}
                >
                    + Add option
                </button>
            </div>
        </div>
    );
}

export default function QuizForm() {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting, isValid },
    } = useForm<FormValues>({
        resolver: zodResolver(quizSchema),
        mode: 'onChange',
        defaultValues: { title: '', questions: [emptyQuestion()] },
    });
    const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

    function changeType(index: number, type: QuestionType) {
        setValue(`questions.${index}.type`, type, { shouldValidate: true });
        if (type === 'CHECKBOX' && watch(`questions.${index}.options`).length === 0) {
            setValue(`questions.${index}.options`, defaultOptions(), { shouldValidate: true });
        }
    }

    async function onSubmit(values: FormValues) {
        setSubmitError(null);
        try {
            await quizApi.create(toPayload(values));
            router.push('/quizzes');
        } catch (e) {
            setSubmitError((e as Error).message);
        }
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className={styles.field}>
                Quiz title
                <input
                    className="input"
                    placeholder="e.g. JavaScript basics"
                    {...register('title')}
                />
                {errors.title && <span className="error">{errors.title.message}</span>}
            </label>

            {fields.map((field, index) => {
                const type = watch(`questions.${index}.type`);
                const qErrors = errors.questions?.[index];
                return (
                    <div key={field.id} className={`card ${styles.question}`}>
                        <div className={styles.questionHead}>
                            <strong>Question {index + 1}</strong>
                            <button
                                type="button"
                                className="btn btn--danger"
                                disabled={fields.length <= 1}
                                onClick={() => remove(index)}
                            >
                                Remove
                            </button>
                        </div>

                        <div className={styles.field}>
                            Type
                            <Select
                                label="Question type"
                                value={type}
                                options={QUESTION_TYPES}
                                onChange={(value) => changeType(index, value)}
                            />
                        </div>

                        <label className={styles.field}>
                            Question
                            <input className="input" {...register(`questions.${index}.text`)} />
                            {qErrors?.text && <span className="error">{qErrors.text.message}</span>}
                        </label>

                        {type === 'BOOLEAN' && (
                            <div className={styles.radios}>
                                {[true, false].map((value) => (
                                    <label key={String(value)}>
                                        <input
                                            type="radio"
                                            name={`bool-${field.id}`}
                                            checked={
                                                watch(`questions.${index}.booleanAnswer`) === value
                                            }
                                            onChange={() =>
                                                setValue(`questions.${index}.booleanAnswer`, value)
                                            }
                                        />
                                        {value ? 'True' : 'False'}
                                    </label>
                                ))}
                            </div>
                        )}

                        {type === 'INPUT' && (
                            <label className={styles.field}>
                                Correct answer
                                <input
                                    className="input"
                                    {...register(`questions.${index}.textAnswer`)}
                                />
                                {qErrors?.textAnswer && (
                                    <span className="error">{qErrors.textAnswer.message}</span>
                                )}
                            </label>
                        )}

                        {type === 'CHECKBOX' && (
                            <CheckboxOptions
                                index={index}
                                control={control}
                                register={register}
                                error={
                                    qErrors?.options?.message ??
                                    qErrors?.options?.root?.message ??
                                    qErrors?.options?.find?.((o) => o?.text)?.text?.message
                                }
                            />
                        )}
                    </div>
                );
            })}

            {errors.questions?.message && <p className="error">{errors.questions.message}</p>}
            {submitError && <p className="error">{submitError}</p>}

            <div className={styles.actions}>
                <button type="button" className="btn" onClick={() => append(emptyQuestion())}>
                    + Add question
                </button>
                <Button type="submit" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Create quiz'}
                </Button>
            </div>
        </form>
    );
}
