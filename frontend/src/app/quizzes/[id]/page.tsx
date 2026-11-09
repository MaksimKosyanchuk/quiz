import QuizDetail from '@/components/QuizDetail';

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <QuizDetail id={id} />;
}
