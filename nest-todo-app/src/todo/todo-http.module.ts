import { Module } from '@nestjs/common';
import { TodoController } from './todo.controller';
import { TodoModule } from './todo.module';
import { TodoService } from './todo.service';

@Module({
  imports: [TodoModule],
  providers: [TodoService],
  controllers: [TodoController],
})
export class TodoHttpModule {}
