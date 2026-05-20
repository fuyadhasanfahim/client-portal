import { IParticipant } from '@/types/conversation.interface';

export default function getParticipant({
    participants,
    email,
}: {
    participants: IParticipant[];
    email: string;
}) {
    const participant = participants.find(
        (participant) => participant.email !== email
    );

    return participant;
}
