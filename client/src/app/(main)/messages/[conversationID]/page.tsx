import MessageContent from '@/components/messages/MessageContent';

export default async function ConversationIDPage({
    params,
}: {
    params: Promise<{ conversationID: string }>;
}) {
    const { conversationID } = await params;

    return <MessageContent conversationID={conversationID} />;
}
