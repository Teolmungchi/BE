import { Repository } from 'typeorm';
import { ChatRoom } from '../entity/chat-room.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChatRoomRepository extends Repository<ChatRoom> {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly repository: Repository<ChatRoom>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findByUsers(
    user1Id: number,
    user2Id: number,
  ): Promise<ChatRoom | null> {
    return this.findOne({
      where: [
        { user1Id, user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
      relations: ['user1', 'user2'],
    });
  }
}
