import { createHash } from 'crypto';
import { prisma } from '../index';

export class UserService {
  static async resolveParticipantUserId(participantIdRaw: string) {
    const participantId = participantIdRaw.trim();
    const normalizedName = participantId || 'Participant';

    const slug = participantId
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'participant';

    const hash = createHash('sha256').update(participantId).digest('hex').slice(0, 10);
    const syntheticEmail = `${slug}-${hash}@promptwars.local`;

    const user = await prisma.user.upsert({
      where: { email: syntheticEmail },
      update: {
        // Keep display name in sync with latest submitted participant id spelling.
        name: normalizedName
      },
      create: {
        name: normalizedName,
        email: syntheticEmail,
        role: 'user'
      },
    });

    return user.id;
  }
}
