import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/database/prisma.service';
import { TokenService } from '../auth/token.service';
import { ConversationService } from '../conversation/conversation.service';
import { WebsocketGateway } from './websocket.gateway';

jest.mock('uuid', () => ({
  v7: jest.fn(() => 'message-id'),
}));

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: ConversationService,
          useValue: {},
        },
      ],
    }).compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
