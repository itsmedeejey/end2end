import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { keyBundle } from "./types/keyBunle.type";
import { PrismaService } from "src/database/prisma.service";

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



    return userId;

  }






}



