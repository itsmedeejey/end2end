
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";


@Injectable()
export class KeysService {
  constructor(private readonly prisma: PrismaService) { }

  async storePublickey(publicKey: string, userId: string) {
    try {
      await this.prisma.userIdentityKey.upsert({
        where: {
          userId: userId
        },
        update: {
          publicKey: publicKey
        },
        create: {
          userId: userId,
          publicKey: publicKey
        }

      });
      return { success: true };
    } catch (err) {
      throw new InternalServerErrorException(err, "Could not register device keys");
    }


  }




  async getPublicKeys(userUniqueId: string) {

    try {
      const userId = await this.prisma.user.findUnique({ where: { uniqueUserId: userUniqueId }, select: { id: true } })
      if (userId) {

        const publicKey = await this.prisma.userIdentityKey.findUnique({
          where: {
            userId: userId.id
          },
          select: {
            publicKey: true
          }
        })
        return publicKey;

      }

    } catch {
      throw new InternalServerErrorException("could not find publicKey")
    }

  }
}







