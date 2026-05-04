import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { keyBundle } from "./types/keyBundle.type";
import { PrismaService } from "src/database/prisma.service";
import { fetchKeyBundle } from "./types/keyBundle.type";

@Injectable()
export class KeysService {
  constructor(private readonly prisma: PrismaService) { }

  async storePublickey(keyBundle: keyBundle, userId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.userIdentityKey.upsert({
          where: { userId },
          update: {
            publicKey: keyBundle.identityKey,
            registrationId: keyBundle.registrationId
          },
          create: {
            userId,
            publicKey: keyBundle.identityKey,
            registrationId: keyBundle.registrationId
          }
        });

        await tx.userSignedPreKey.upsert({
          where: { userId },
          update: {
            keyId: keyBundle.signedPreKey.keyId,
            publicKey: keyBundle.signedPreKey.publicKey,
            signature: keyBundle.signedPreKey.signature,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          create: {
            userId,
            keyId: keyBundle.signedPreKey.keyId,
            publicKey: keyBundle.signedPreKey.publicKey,
            signature: keyBundle.signedPreKey.signature,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        await tx.userOneTimePreKey.createMany({
          data: keyBundle.preKeys.map(pk => ({
            keyId: pk.keyId,
            publicKey: pk.publicKey,
            userId
          })),
          skipDuplicates: true
        });
      });

      return { success: true };

    } catch (error) {

      //eslint-disable-next-line
      console.error(error);

      throw new InternalServerErrorException("Could not register device keys");
    }


  }




  async getPublicKeys(userId: string) {

    return await this.prisma.$transaction(async (tx) => {

      // Atomically claim ONE one-time prekey
      // (prevents race conditions)

      const claimedPreKey = await tx.$queryRawUnsafe<
        {
          id: string;
          keyId: number;
          publicKey: string;
        }[]
      >(`
      UPDATE "UserOneTimePreKey"
      SET "isUsed" = true, "usedAt" = NOW()
      WHERE id = (
        SELECT id FROM "UserOneTimePreKey"
        WHERE "userId" = $1 AND "isUsed" = false
        ORDER BY "createdAt" ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, "keyId", "publicKey";
    `, userId);

      const oneTimePreKey = claimedPreKey[0] || null;


      //Fetch identity + signed prekey

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          identityKey: {
            select: {
              registrationId: true,
              publicKey: true
            }
          },
          signedPreKeys: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              keyId: true,
              publicKey: true,
              signature: true
            }
          }
        }
      });

      if (!user || !user.identityKey) {
        throw new Error("User or identity key not found");
      }

      const signedPreKey = user.signedPreKeys[0];


      //3. Construct final bundle (Signal-compatible structure)

      const bundle: fetchKeyBundle = {
        registrationId: user.identityKey.registrationId,
        identityKey: user.identityKey.publicKey,

        signedPreKey:
        {
          keyId: signedPreKey.keyId,
          publicKey: signedPreKey.publicKey,
          signature: signedPreKey.signature
        }
        ,

        //  may be absent
        preKey: oneTimePreKey
          ? {
            keyId: oneTimePreKey.keyId,
            publicKey: oneTimePreKey.publicKey
          }
          : undefined
      };

      return bundle;
    });
  }




}



