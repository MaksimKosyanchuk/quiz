import QuizTake from '@/components/QuizTake';

export default async function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <QuizTake id={id} />;
}
