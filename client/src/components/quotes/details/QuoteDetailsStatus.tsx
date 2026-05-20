import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { IconTool } from '@tabler/icons-react';

export default function QuoteDetailsStatus({
    status,
    role,
}: {
    status: string;
    role: string;
}) {
    const isCustomer = role === 'user';

    const getStatusCard = () => {
        switch (status) {
            case 'in-revision':
                return {
                    color: 'yellow',
                    title: isCustomer
                        ? 'Your quote is under revision'
                        : 'Quote marked as "In Revision"',
                    message: isCustomer
                        ? 'Our team is working on the requested changes.'
                        : `You marked the quote for revision. Awaiting updated submission.`,
                };
            case 'in-progress':
                return {
                    color: 'blue',
                    title: isCustomer
                        ? 'Your quote is in progress'
                        : 'Quote marked as "In Progress"',
                    message: isCustomer
                        ? 'Our team is currently working on your quote.'
                        : `You marked the quote as in progress. It's currently being worked on.`,
                };
            case 'completed':
                return {
                    color: 'green',
                    title: isCustomer
                        ? 'Your quote is completed'
                        : 'Quote marked as "Completed"',
                    message: isCustomer
                        ? 'The final version has been delivered.'
                        : `You marked this quote as completed.`,
                };
            case 'pending':
                return {
                    color: 'yellow',
                    title: isCustomer
                        ? 'Your quote is pending'
                        : 'Quote is pending',
                    message: isCustomer
                        ? 'We’ve received your request. Processing will start soon.'
                        : `You’ve created a pending quote. Awaiting further action.`,
                };
            default:
                return null;
        }
    };

    const statusCard = getStatusCard();

    if (!statusCard) return null;

    const { color, title, message } = statusCard;

    return (
        <Card className={`bg-${color}-50 border-l-4 border-${color}-500`}>
            <CardContent>
                <CardTitle
                    className={`text-${color}-800 text-2xl flex items-center gap-2`}
                >
                    <IconTool size={24} />
                    <span>{title}</span>
                </CardTitle>
                <p className={`text-sm text-${color}-700`}>{message}</p>
            </CardContent>
        </Card>
    );
}
