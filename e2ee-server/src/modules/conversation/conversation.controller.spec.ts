import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

describe('ConversationController', () => {
  let controller: ConversationController;
  let conversationService: jest.Mocked<ConversationService>;

  beforeEach(async () => {
    const conversationServiceMock = {
      findOrCreateConversationId: jest.fn(),
      getUserDeatails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        {
          provide: ConversationService,
          useValue: conversationServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
    conversationService = module.get(ConversationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('returns conversation id with user details', async () => {
    conversationService.findOrCreateConversationId.mockResolvedValue({
      conversationId: 'conversation-1',
      user: {
        displayName: 'Alice',
        uniqueUserId: 'alice123',
      },
    });

    const result = await controller.findOrCreateConversation(
      { to: 'alice123' },
      { user: { sub: 'current-user-id' } } as any,
    );

    expect(conversationService.findOrCreateConversationId).toHaveBeenCalledWith(
      'alice123',
      'current-user-id',
    );
    expect(result).toEqual({
      conversationId: 'conversation-1',
      user: {
        displayName: 'Alice',
        uniqueUserId: 'alice123',
      },
    });
  });
});
